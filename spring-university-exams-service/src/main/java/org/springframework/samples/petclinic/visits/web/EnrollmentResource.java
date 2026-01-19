/*
 * Copyright 2002-2021 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.springframework.samples.petclinic.visits.web;

import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;

import io.micrometer.core.annotation.Timed;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.samples.petclinic.visits.model.Enrollment;
import org.springframework.samples.petclinic.visits.model.EnrollmentRepository;
import org.springframework.web.bind.annotation.*;

/**
 * Enrollment REST controller for managing student course enrollments
 *
 * @author Juergen Hoeller
 * @author Ken Krebs
 * @author Arjen Poutsma
 * @author Michael Isvy
 * @author Maciej Szarlinski
 * @author Ramazan Sakin
 */
@RestController
@RequestMapping("/enrollments")
@Timed("petclinic.enrollment")
class EnrollmentResource {

    private static final Logger log = LoggerFactory.getLogger(EnrollmentResource.class);
    private static final int MAX_COURSES_PER_STUDENT = 7;

    private final EnrollmentRepository enrollmentRepository;

    EnrollmentResource(EnrollmentRepository enrollmentRepository) {
        this.enrollmentRepository = enrollmentRepository;
    }

    @PostMapping("/students/{studentId}/courses/{courseId}")
    @ResponseStatus(HttpStatus.CREATED)
    public Enrollment create(
        @PathVariable("studentId") @Min(1) int studentId,
        @PathVariable("courseId") @Min(1) int courseId) {

        // Check if student is already enrolled in this course (prevent duplicates)
        if (enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new IllegalStateException("Student is already enrolled in this course");
        }

        // Validate max 7 courses per student
        long currentEnrollments = enrollmentRepository.countByStudentId(studentId);
        if (currentEnrollments >= MAX_COURSES_PER_STUDENT) {
            throw new IllegalStateException("Student cannot enroll in more than " + MAX_COURSES_PER_STUDENT + " courses per semester");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setStudentId(studentId);
        enrollment.setCourseId(courseId);

        log.info("Creating enrollment for student {} in course {}", studentId, courseId);
        return enrollmentRepository.save(enrollment);
    }

    @GetMapping("/students/{studentId}")
    public List<Enrollment> getStudentEnrollments(@PathVariable("studentId") @Min(1) int studentId) {
        return enrollmentRepository.findByStudentId(studentId);
    }

    @GetMapping("/courses/{courseId}")
    public List<Enrollment> getCourseEnrollments(@PathVariable("courseId") @Min(1) int courseId) {
        return enrollmentRepository.findByCourseId(courseId);
    }

    @GetMapping("/students/bulk")
    public Enrollments getEnrollmentsByStudentIds(@RequestParam("studentId") List<Integer> studentIds) {
        final List<Enrollment> enrollments = enrollmentRepository.findByStudentIdIn(studentIds);
        return new Enrollments(enrollments);
    }

    @DeleteMapping("/{enrollmentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("enrollmentId") @Min(1) int enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new IllegalArgumentException("Enrollment " + enrollmentId + " not found"));

        enrollmentRepository.delete(enrollment);
        log.info("Deleted enrollment {}", enrollment);
    }

    record Enrollments(
        List<Enrollment> items
    ) {
    }
}
