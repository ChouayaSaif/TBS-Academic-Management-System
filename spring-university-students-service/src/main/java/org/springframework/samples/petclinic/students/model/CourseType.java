package org.springframework.samples.petclinic.customers.model;

import jakarta.persistence.*;

@Entity
@Table(name = "course_types")
public class CourseType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name")
    private String name;

    public Integer getId() { return this.id; }
    public String getName() { return this.name; }
    public void setId(Integer id) { this.id = id; }
    public void setName(String name) { this.name = name; }
}

