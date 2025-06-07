package Milan.Ai_sypmtom.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long PatientId;
    private String Name;
    private String City;
    private String State;
    private String Pincode;
    private String Area;
    private  String Country;

    private int age;
    private String Gender;
    private String MobileNo;

    private String  MedicalHistory;

    @OneToMany(mappedBy = "patient")
    @JsonIgnore

    private List<Appointment> appointments;

    @OneToOne
    @JoinColumn(name = "user_id")
    @JsonBackReference

    private UserInfo user;
    public Long getPatientId() {
        return PatientId;
    }

    public void setPatientId(Long patientId) {
        PatientId = patientId;
    }

    public String getCity() {
        return City;
    }

    public void setCity(String city) {
        City = city;
    }

    public String getState() {
        return State;
    }

    public void setState(String state) {
        State = state;
    }

    public String getPincode() {
        return Pincode;
    }

    public void setPincode(String pincode) {
        Pincode = pincode;
    }

    public String getArea() {
        return Area;
    }

    public void setArea(String area) {
        Area = area;
    }

    public String getCountry() {
        return Country;
    }

    public void setCountry(String country) {
        Country = country;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getGender() {
        return Gender;
    }

    public void setGender(String gender) {
        Gender = gender;
    }

    public String getMedicalHistory() {
        return MedicalHistory;
    }

    public void setMedicalHistory(String medicalHistory) {
        MedicalHistory = medicalHistory;
    }

    public List<Appointment> getAppointments() {
        return appointments;
    }

    public void setAppointments(List<Appointment> appointments) {
        this.appointments = appointments;
    }

    public UserInfo getUser() {
        return user;
    }

    public void setUser(UserInfo user) {
        this.user = user;
    }


}
