package org.springframework.samples.petclinic.customers.web;

import org.springframework.samples.petclinic.customers.model.Course;
import org.springframework.samples.petclinic.customers.model.CourseType;

/**
 * Course details DTO
 */
record CourseDetails(
    long id,
    String title,
    String student,
    int credits,
    CourseType type
) {
    public CourseDetails(Course course) {
        this(course.getId(), course.getTitle(),
             course.getStudent().getFirstName() + " " + course.getStudent().getLastName(),
             course.getCredits(), course.getType());
    }
}
