"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { healthAPI } from "../services/api";
import {
  Search,
  User,
  FileText,
  AlertCircle,
  Stethoscope,
  Brain,
  TrendingUp,
  Activity,
  Heart,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Shield,
} from "lucide-react";

const SymptomChecker = () => {
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const parseAIResponse = (responseData) => {
    try {
      let parsedData = null;

      // If it's already an object, use it directly
      if (typeof responseData === "object" && responseData !== null) {
        parsedData = responseData;
      } else if (typeof responseData === "string") {
        // Try to find JSON in the string
        const jsonMatch = responseData.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsedData = JSON.parse(jsonMatch[0]);
          } catch (parseError) {
            console.error("JSON parse error:", parseError);
            return extractInfoFromText(responseData);
          }
        } else {
          return extractInfoFromText(responseData);
        }
      }

      // Enhanced validation and structure for the expected JSON format
      if (parsedData) {
        return {
          symptoms: Array.isArray(parsedData.symptoms)
            ? parsedData.symptoms
            : parsedData.symptoms
            ? [parsedData.symptoms]
            : [],
          conditions: Array.isArray(parsedData.conditions)
            ? parsedData.conditions.map((condition) => ({
                name:
                  typeof condition === "string"
                    ? condition
                    : condition.name || condition,
                probability:
                  typeof condition === "object" && condition.probability
                    ? condition.probability
                    : "Unknown",
                description:
                  typeof condition === "object" && condition.description
                    ? condition.description
                    : null,
                urgency:
                  typeof condition === "object" && condition.urgency
                    ? condition.urgency
                    : "normal",
              }))
            : parsedData.conditions
            ? [
                {
                  name: parsedData.conditions,
                  probability: "Unknown",
                  description: null,
                  urgency: "normal",
                },
              ]
            : [],
          advice: Array.isArray(parsedData.advice)
            ? parsedData.advice
            : typeof parsedData.advice === "string"
            ? [parsedData.advice]
            : parsedData.recommendations
            ? Array.isArray(parsedData.recommendations)
              ? parsedData.recommendations
              : [parsedData.recommendations]
            : [],
          doctor:
            parsedData.doctor ||
            parsedData.recommendedSpecialist ||
            parsedData.specialist ||
            "General Practitioner or Mental Health Professional",
          severity: parsedData.severity || "moderate",
          urgency: parsedData.urgency || "normal",
          success: true,
        };
      }

      return { advice: ["Unable to process the response"], success: false };
    } catch (error) {
      console.error("Error parsing AI response:", error);
      return extractInfoFromText(responseData);
    }
  };

  // Enhanced helper function to extract information from plain text
  const extractInfoFromText = (text) => {
    const symptoms = [];
    const conditions = [];
    const advice = [];
    let doctor = null;

    // Extract symptoms (look for common patterns)
    const symptomPatterns = [
      /symptoms?[:\s]+([^.]+)/gi,
      /experiencing[:\s]+([^.]+)/gi,
      /signs?[:\s]+([^.]+)/gi,
      /you (?:have|are experiencing|show)[:\s]+([^.]+)/gi,
    ];

    symptomPatterns.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          const extracted = match
            .replace(
              /symptoms?[:\s]+|experiencing[:\s]+|signs?[:\s]+|you (?:have|are experiencing|show)[:\s]+/gi,
              ""
            )
            .trim()
            .split(/,|and/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

          extracted.forEach((symptom) => {
            if (symptom && !symptoms.includes(symptom)) {
              symptoms.push(symptom);
            }
          });
        });
      }
    });

    // Extract conditions with probabilities
    const conditionPatterns = [
      /(?:could be|might be|possibly|likely|suggests?)[:\s]+([^.]+)/gi,
      /(?:diagnosis|condition)[:\s]+([^.]+)/gi,
      /(\d+%)\s*(?:chance|probability|likelihood)\s*(?:of|for)\s*([^.]+)/gi,
      /([^.]+)\s*(?:with|at)\s*(\d+%)\s*(?:chance|probability|likelihood)/gi,
    ];

    conditionPatterns.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          // Check if it contains percentage
          const percentMatch = match.match(/(\d+)%/);
          const probability = percentMatch ? `${percentMatch[1]}%` : "Unknown";

          const conditionName = match
            .replace(
              /(?:could be|might be|possibly|likely|suggests?|diagnosis|condition)[:\s]+/gi,
              ""
            )
            .replace(
              /\d+%\s*(?:chance|probability|likelihood)\s*(?:of|for)\s*/gi,
              ""
            )
            .replace(
              /\s*(?:with|at)\s*\d+%\s*(?:chance|probability|likelihood)/gi,
              ""
            )
            .trim();

          if (conditionName) {
            conditions.push({ name: conditionName, probability });
          }
        });
      }
    });

    // Extract advice (look for recommendations)
    const advicePatterns = [
      /(?:recommend|suggest|advise|should)[^.]+\./gi,
      /(?:try|consider|avoid)[^.]+\./gi,
      /it(?:'s| is) (?:important|recommended|advised)[^.]+\./gi,
    ];

    advicePatterns.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          const cleanAdvice = match.trim();
          if (!advice.includes(cleanAdvice)) {
            advice.push(cleanAdvice);
          }
        });
      }
    });

    // Extract doctor recommendation
    const doctorPatterns = [
      /(?:see|consult|visit)\s+(?:a\s+)?([a-z]+ologist|doctor|physician|specialist)/gi,
      /(?:specialist|expert)\s*[:\s]+([^.]+)/gi,
      /recommend(?:ed)?\s+(?:seeing\s+)?(?:a\s+)?([a-z]+ologist|doctor|physician)/gi,
    ];

    doctorPatterns.forEach((pattern) => {
      const match = text.match(pattern);
      if (match && match[1]) {
        doctor = match[1].trim();
      }
    });

    return {
      symptoms: symptoms.slice(0, 5), // Limit to 5 symptoms
      conditions: conditions.slice(0, 3), // Limit to 3 conditions
      advice: advice.length > 0 ? advice : [text], // Use full text as advice if no specific advice found
      doctor: doctor,
      success: true,
      isPlainText: advice.length === 0, // Mark as plain text if no structured advice found
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await healthAPI.getAdvice(formData);
      console.log("Raw AI response:", response.data); // Debug log

      const parsedResult = parseAIResponse(response.data);
      console.log("Parsed result:", parsedResult); // Debug log

      setResult(parsedResult);
    } catch (error) {
      setError("Failed to get health advice. Please try again.");
      console.error("Error getting health advice:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderSymptoms = (symptoms) => {
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0)
      return null;

    return (
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
          <Search className="h-5 w-5 mr-2" />
          Identified Symptoms
        </h3>
        <div className="flex flex-wrap gap-3">
          {symptoms.map((symptom, index) => (
            <div
              key={index}
              className="flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full border border-blue-300"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              <span className="font-medium capitalize">{symptom}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderConditions = (conditions) => {
    if (!conditions || !Array.isArray(conditions) || conditions.length === 0)
      return null;

    return (
      <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
        <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Possible Conditions
        </h3>
        <div className="space-y-4">
          {conditions.map((condition, index) => {
            const probabilityText = condition.probability || "Unknown";
            const probabilityMatch = probabilityText.match(/(\d+)/);
            const probability = probabilityMatch
              ? Number.parseInt(probabilityMatch[1])
              : 0;

            const urgencyLevel =
              condition.urgency === "high" || probability >= 70
                ? "high"
                : condition.urgency === "medium" || probability >= 40
                ? "medium"
                : "low";

            return (
              <div
                key={index}
                className="bg-white rounded-lg p-4 border border-purple-200 shadow-sm"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900 text-lg">
                      {condition.name}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        urgencyLevel === "high"
                          ? "bg-red-100 text-red-800"
                          : urgencyLevel === "medium"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {urgencyLevel.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-purple-600 font-bold text-lg">
                    {probabilityText}
                  </span>
                </div>

                {probability > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                        urgencyLevel === "high"
                          ? "bg-gradient-to-r from-red-500 to-red-600"
                          : urgencyLevel === "medium"
                          ? "bg-gradient-to-r from-orange-500 to-orange-600"
                          : "bg-gradient-to-r from-blue-500 to-blue-600"
                      }`}
                      style={{ width: `${Math.min(probability, 100)}%` }}
                    ></div>
                  </div>
                )}

                {condition.description && (
                  <p className="text-sm text-gray-600 mb-2 bg-gray-50 p-2 rounded">
                    {condition.description}
                  </p>
                )}

                <p className="text-sm text-gray-600">
                  {probability >= 70
                    ? "⚠️ High probability - Seek immediate medical attention"
                    : probability >= 40
                    ? "⚡ Moderate probability - Schedule appointment soon"
                    : probability > 0
                    ? "📋 Lower probability - Monitor symptoms and consult if worsening"
                    : "📝 Possible condition - Discuss with healthcare provider"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAdvice = (advice) => {
    if (!advice || (!Array.isArray(advice) && typeof advice !== "string"))
      return null;

    const adviceArray = Array.isArray(advice) ? advice : [advice];

    return (
      <div className="bg-green-50 rounded-xl p-6 border border-green-200">
        <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center">
          <Lightbulb className="h-5 w-5 mr-2" />
          Health Recommendations
        </h3>
        <div className="space-y-3">
          {adviceArray.map((adviceItem, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 bg-white rounded-lg p-4 border border-green-200 shadow-sm"
            >
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">
                  {index + 1}
                </span>
              </div>
              <p className="text-gray-700 font-medium leading-relaxed">
                {adviceItem}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDoctorRecommendation = (doctorType) => {
    if (!doctorType) return null;

    return (
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
        <h3 className="text-xl font-bold text-orange-900 mb-4 flex items-center">
          <Stethoscope className="h-5 w-5 mr-2" />
          Recommended Specialist
        </h3>
        <div className="bg-white rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-semibold text-orange-900">
              {doctorType}
            </span>
            <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              Specialist
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Based on your symptoms, consulting with a {doctorType.toLowerCase()}{" "}
            would be most appropriate for proper diagnosis and treatment.
          </p>
          <Link
            to="/find-doctors"
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Find {doctorType}s
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      </div>
    );
  };

  const renderSeverityIndicator = (severity, urgency) => {
    if (!severity && !urgency) return null;

    const getSeverityColor = (level) => {
      switch (level?.toLowerCase()) {
        case "high":
        case "severe":
          return "red";
        case "medium":
        case "moderate":
          return "orange";
        case "low":
        case "mild":
          return "green";
        default:
          return "blue";
      }
    };

    const getUrgencyColor = (level) => {
      switch (level?.toLowerCase()) {
        case "urgent":
        case "immediate":
          return "red";
        case "soon":
        case "moderate":
          return "orange";
        case "normal":
        case "routine":
          return "green";
        default:
          return "blue";
      }
    };

    return (
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
        <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Assessment Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {severity && (
            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Severity Level
                </span>
                <span
                  className={`px-3 py-1 text-sm font-bold rounded-full ${
                    getSeverityColor(severity) === "red"
                      ? "bg-red-100 text-red-800"
                      : getSeverityColor(severity) === "orange"
                      ? "bg-orange-100 text-orange-800"
                      : getSeverityColor(severity) === "green"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {severity.toUpperCase()}
                </span>
              </div>
            </div>
          )}

          {urgency && (
            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Urgency Level
                </span>
                <span
                  className={`px-3 py-1 text-sm font-bold rounded-full ${
                    getUrgencyColor(urgency) === "red"
                      ? "bg-red-100 text-red-800"
                      : getUrgencyColor(urgency) === "orange"
                      ? "bg-orange-100 text-orange-800"
                      : getUrgencyColor(urgency) === "green"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {urgency.toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Symptom Checker
          </h1>
          <p className="text-xl text-gray-600">
            Get intelligent health insights powered by advanced AI
          </p>
        </div>

        {/* Disclaimer */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start">
              <Shield className="h-6 w-6 text-yellow-600 mt-1 mr-4 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Important Medical Disclaimer
                </h3>
                <p className="text-yellow-700">
                  This AI symptom checker provides general health information
                  and should not replace professional medical advice. Always
                  consult with a qualified healthcare provider for proper
                  diagnosis and treatment. In case of emergency, contact your
                  local emergency services immediately.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Input Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold flex items-center">
                <FileText className="h-6 w-6 mr-3" />
                Tell us about your symptoms
              </h2>
              <p className="text-blue-100 mt-2">
                Provide detailed information for accurate analysis
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="age"
                    className="block text-sm font-semibold text-gray-700 mb-3"
                  >
                    <User className="inline h-4 w-4 mr-2" />
                    Age
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    min="1"
                    max="120"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter your age"
                    value={formData.age}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="gender"
                    className="block text-sm font-semibold text-gray-700 mb-3"
                  >
                    <User className="inline h-4 w-4 mr-2" />
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-gray-700 mb-3"
                >
                  <FileText className="inline h-4 w-4 mr-2" />
                  Describe your symptoms
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={8}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  placeholder="Please describe your symptoms in detail:
• When did they start?
• How severe are they (1-10)?
• What makes them better or worse?
• Any other relevant information..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-4 px-6 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Analyzing symptoms...
                  </>
                ) : (
                  <>
                    <Brain className="h-6 w-6 mr-3" />
                    Get AI Analysis
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold flex items-center">
                <Activity className="h-6 w-6 mr-3" />
                AI Analysis Results
              </h2>
              <p className="text-green-100 mt-2">
                Comprehensive health insights based on your symptoms
              </p>
            </div>

            <div className="p-8">
              {!result ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                    <Stethoscope className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Ready for Analysis
                  </h3>
                  <p className="text-gray-500">
                    Fill out the form to get your AI-powered health analysis
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {result.success === false ? (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-xl flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <p className="font-medium">
                        {result.error || "Failed to analyze symptoms"}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Render structured response */}
                      {result.symptoms && renderSymptoms(result.symptoms)}
                      {(result.severity || result.urgency) &&
                        renderSeverityIndicator(
                          result.severity,
                          result.urgency
                        )}
                      {result.conditions && renderConditions(result.conditions)}
                      {result.advice && renderAdvice(result.advice)}
                      {result.doctor &&
                        renderDoctorRecommendation(result.doctor)}

                      {/* Plain text response fallback */}
                      {result.isPlainText && (
                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                          <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                            <Brain className="h-5 w-5 mr-2" />
                            AI Health Analysis
                          </h3>
                          <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                              {result.advice}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Call to Action */}
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                        <h3 className="text-xl font-bold mb-3 flex items-center">
                          <Heart className="h-5 w-5 mr-2" />
                          Next Steps
                        </h3>
                        <p className="text-blue-100 mb-4">
                          Based on your symptoms, we recommend consulting with a
                          healthcare professional for proper diagnosis and
                          treatment.
                        </p>
                        <Link
                          to="/find-doctors"
                          className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors transform hover:scale-105"
                        >
                          Find Doctors Near You
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymptomChecker;
