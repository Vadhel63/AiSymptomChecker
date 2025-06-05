package Milan.Ai_sypmtom.controller;


import Milan.Ai_sypmtom.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/Api")
public class HealthController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/Get-advice")
    public String getAdvice(@RequestBody Map<String, String> userData) {
        String age = userData.getOrDefault("age", "unknown");
        String gender = userData.getOrDefault("gender", "unknown");
        String description = userData.getOrDefault("description", "none");

        String prompt = """
You are an intelligent health assistant.

The user has provided:
- Age: %s
- Gender: %s
- Health Description: \"%s\"

Your tasks:
1. Identify the user's key symptoms from the description.
2. Based on the symptoms, age, and gender, return a list of likely diseases or conditions with probability (each with %%).
3. Give at least two pieces of general health advice.
4. Recommend what type of doctor the user should consult.

Return your response in EXACTLY the following JSON format:
{
  "symptoms": ["symptom1", "symptom2", ...],
  "conditions": [
    {"name": "Disease Name", "probability": "XX%%"},
    ...
  ],
  "advice": [
    "Advice 1",
    "Advice 2"
  ],
  "doctor": "Specialist type"
}

Do NOT include any extra text or explanation — only respond with clean JSON.
""".formatted(age, gender, description);


        return geminiService.getAdviceFromGemini(prompt);
    }
}

