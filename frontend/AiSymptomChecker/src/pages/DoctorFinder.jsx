"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { doctorAPI } from "../services/api";
import {
  Search,
  MapPin,
  Star,
  Clock,
  DollarSign,
  UserCircle,
  Calendar,
  Filter,
  Award,
  Building,
  Phone,
  Mail,
  Stethoscope,
} from "lucide-react";

const DoctorFinder = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    specialization: "",
    city: "",
    state: "",
    minExperience: "",
    maxFee: "",
    availability: "",
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchTerm, filters]);

  const fetchDoctors = async () => {
    try {
      const response = await doctorAPI.getAllDoctors();
      console.log("Doctors response:", response.data); // Debug log

      setDoctors(response.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = [...doctors]; // Create a copy to avoid mutation

    // Search by name or specialization
    if (searchTerm) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.user?.userName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          doctor.specialization
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          doctor.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by specialization
    if (filters.specialization) {
      filtered = filtered.filter((doctor) =>
        doctor.specialization
          ?.toLowerCase()
          .includes(filters.specialization.toLowerCase())
      );
    }

    // Filter by city
    if (filters.city) {
      filtered = filtered.filter((doctor) =>
        doctor.city?.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    // Filter by state
    if (filters.state) {
      filtered = filtered.filter((doctor) =>
        doctor.state?.toLowerCase().includes(filters.state.toLowerCase())
      );
    }

    // Filter by minimum experience
    if (filters.minExperience) {
      filtered = filtered.filter(
        (doctor) => doctor.experience >= Number.parseInt(filters.minExperience)
      );
    }

    // Filter by max fee
    if (filters.maxFee) {
      filtered = filtered.filter(
        (doctor) => doctor.checkUpFee <= Number.parseInt(filters.maxFee)
      );
    }

    // Filter by availability
    if (filters.availability) {
      filtered = filtered.filter((doctor) =>
        doctor.availability
          ?.toLowerCase()
          .includes(filters.availability.toLowerCase())
      );
    }

    setFilteredDoctors(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      specialization: "",
      city: "",
      state: "",
      minExperience: "",
      maxFee: "",
      availability: "",
    });
    setSearchTerm("");
  };

  const getUniqueValues = (field) => {
    const values = doctors
      .map((doctor) => doctor[field])
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
    return values;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            Finding the best doctors for you...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Find Expert Doctors
          </h1>
          <p className="text-xl text-gray-600">
            Connect with qualified healthcare professionals near you
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-8">
          <div className="p-6">
            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by doctor name, specialization, or city..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center space-x-2"
              >
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filters.specialization}
                      onChange={(e) =>
                        handleFilterChange("specialization", e.target.value)
                      }
                    >
                      <option value="">All Specializations</option>
                      {getUniqueValues("specialization").map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filters.city}
                      onChange={(e) =>
                        handleFilterChange("city", e.target.value)
                      }
                    >
                      <option value="">All Cities</option>
                      {getUniqueValues("city").map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filters.state}
                      onChange={(e) =>
                        handleFilterChange("state", e.target.value)
                      }
                    >
                      <option value="">All States</option>
                      {getUniqueValues("state").map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Experience
                    </label>
                    <input
                      type="number"
                      placeholder="Years"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filters.minExperience}
                      onChange={(e) =>
                        handleFilterChange("minExperience", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Fee (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="Amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filters.maxFee}
                      onChange={(e) =>
                        handleFilterChange("maxFee", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Availability
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Morning"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filters.availability}
                      onChange={(e) =>
                        handleFilterChange("availability", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                  <p className="text-sm text-gray-600">
                    Showing {filteredDoctors.length} of {doctors.length} doctors
                  </p>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-lg text-gray-700">
            Found{" "}
            <span className="font-bold text-blue-600">
              {filteredDoctors.length}
            </span>{" "}
            qualified doctors
          </p>
        </div>

        {/* Doctors Grid */}
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <UserCircle className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No doctors found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or filters
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.doctorId}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 overflow-hidden group"
              >
                {/* Doctor Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <UserCircle className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        Dr.{doctor.name || "XYZ"}
                      </h3>
                      <p className="text-blue-100 font-medium">
                        {doctor.specialization}
                      </p>
                      
                    </div>
                  </div>
                </div>
                {/* Doctor Details */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Experience & Fee */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Award className="h-4 w-4 mr-2" />
                        <span className="text-sm">
                          {doctor.experience} years experience
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span className="text-sm font-semibold">
                          ₹{doctor.checkUpFee}
                        </span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">
                        {doctor.area && `${doctor.area}, `}
                        {doctor.city}, {doctor.state}
                      </span>
                    </div>

                    {/* Clinic */}
                    {doctor.clinicName && (
                      <div className="flex items-center text-gray-600">
                        <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">{doctor.clinicName}</span>
                      </div>
                    )}

                    {/* Availability */}
                    {doctor.availability && (
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">{doctor.availability}</span>
                      </div>
                    )}

                    {/* Qualifications */}
                    {doctor.qualification && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700">
                          <strong>Qualifications:</strong>{" "}
                          {doctor.qualification}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 space-y-3">
                    <Link
                      to={`/book-appointment/${doctor.doctorId}`}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center font-medium group-hover:scale-105"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Appointment
                    </Link>

                    <div className="grid grid-cols-2 gap-2">
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center justify-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {doctor.mobileNo}
                      </button>
                    </div>
                  </div>
                </div>
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Available
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorFinder;
