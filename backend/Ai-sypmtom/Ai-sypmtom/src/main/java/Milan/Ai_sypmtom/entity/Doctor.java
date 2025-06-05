package Milan.Ai_sypmtom.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Optional;

@Entity
@Data
@NoArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long doctorId;

    private String ClinicName;
    private int Experience;
    private String Specialization;
    private int CheckUpFee;
    private String City;
    private String State;
    private String Pincode;
    private String Area;
    private  String Country;
    private String Qualification;
    private String Availability;
    private String licenseProofPath;
    private String MobileNo;
    @OneToOne
    @JoinColumn(name = "user_id")
    @JsonBackReference

    private UserInfo user;
    @OneToMany(mappedBy = "doctor")
    @JsonIgnore

    private List<Appointment> appointments;// Store path to uploaded file

    public UserInfo getUser() {
        return user;
    }

    public void setUser(UserInfo user) {
        this.user = user;
    }

    public List<Appointment> getAppointments() {
        return appointments;
    }

    public void setAppointments(List<Appointment> appointments) {
        this.appointments = appointments;
    }

    public String getLicenseProofPath() {
        return licenseProofPath;
    }

    public void setLicenseProofPath(String licenseProofPath) {
        this.licenseProofPath = licenseProofPath;
    }

    public String getAvailability() {
        return Availability;
    }

    public void setAvailability(String availability) {
        Availability = availability;
    }

    public String getQualification() {
        return Qualification;
    }

    public void setQualification(String qualification) {
        Qualification = qualification;
    }

    public String getCountry() {
        return Country;
    }

    public void setCountry(String country) {
        Country = country;
    }

    public String getArea() {
        return Area;
    }

    public void setArea(String area) {
        Area = area;
    }

    public String getPincode() {
        return Pincode;
    }

    public void setPincode(String pincode) {
        Pincode = pincode;
    }

    public String getState() {
        return State;
    }

    public void setState(String state) {
        State = state;
    }

    public String getCity() {
        return City;
    }

    public void setCity(String city) {
        City = city;
    }

    public int getCheckUpFee() {
        return CheckUpFee;
    }

    public void setCheckUpFee(int checkUpFee) {
        CheckUpFee = checkUpFee;
    }

    public String getSpecialization() {
        return Specialization;
    }

    public void setSpecialization(String specialization) {
        Specialization = specialization;
    }

    public int getExperience() {
        return Experience;
    }

    public void setExperience(int experience) {
        Experience = experience;
    }

    public String getClinicName() {
        return ClinicName;
    }

    public void setClinicName(String clinicName) {
        ClinicName = clinicName;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        doctorId = doctorId;
    }



}
