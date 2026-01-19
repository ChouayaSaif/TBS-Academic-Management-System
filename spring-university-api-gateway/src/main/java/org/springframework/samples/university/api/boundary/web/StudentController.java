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
package org.springframework.samples.university.api.boundary.web;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * REST Controller for Student operations - works in standalone mode
 */
@RestController
@RequestMapping("/api/students")
public class StudentController {

    // In-memory storage for local development
    private final Map<Integer, Map<String, Object>> students = new ConcurrentHashMap<>();
    private final AtomicInteger idGenerator = new AtomicInteger(1);

    public StudentController() {
        // Add some sample data
        addSampleStudent("John", "Doe", "STU001", "john.doe@tbs.edu", "Computer Science");
        addSampleStudent("Jane", "Smith", "STU002", "jane.smith@tbs.edu", "Business Administration");
        addSampleStudent("Ahmed", "Ben Ali", "STU003", "ahmed.benali@tbs.edu", "Finance");
    }

    private void addSampleStudent(String firstName, String lastName, String studentId, String email, String department) {
        int id = idGenerator.getAndIncrement();
        Map<String, Object> student = new HashMap<>();
        student.put("id", id);
        student.put("firstName", firstName);
        student.put("lastName", lastName);
        student.put("studentId", studentId);
        student.put("email", email);
        student.put("department", department);
        student.put("courses", new ArrayList<>());
        students.put(id, student);
    }

    @GetMapping
    public Flux<Map<String, Object>> getAllStudents() {
        return Flux.fromIterable(students.values());
    }

    @GetMapping("/{studentId}")
    public Mono<Map<String, Object>> getStudent(@PathVariable int studentId) {
        Map<String, Object> student = students.get(studentId);
        if (student != null) {
            return Mono.just(student);
        }
        return Mono.empty();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<Map<String, Object>> createStudent(@RequestBody Map<String, Object> studentData) {
        int id = idGenerator.getAndIncrement();
        studentData.put("id", id);
        studentData.put("courses", new ArrayList<>());
        students.put(id, studentData);
        return Mono.just(studentData);
    }

    @PutMapping("/{studentId}")
    public Mono<Void> updateStudent(@PathVariable int studentId, @RequestBody Map<String, Object> studentData) {
        if (students.containsKey(studentId)) {
            studentData.put("id", studentId);
            Map<String, Object> existing = students.get(studentId);
            studentData.put("courses", existing.get("courses"));
            students.put(studentId, studentData);
        }
        return Mono.empty();
    }

    @PostMapping("/{studentId}/courses")
    public Mono<Map<String, Object>> registerCourses(@PathVariable int studentId, @RequestBody Map<String, Object> courseRegistration) {
        Map<String, Object> student = students.get(studentId);
        if (student != null) {
            @SuppressWarnings("unchecked")
            List<Integer> courseIds = (List<Integer>) courseRegistration.get("courseIds");
            student.put("courses", courseIds != null ? courseIds : new ArrayList<>());
            return Mono.just(student);
        }
        return Mono.empty();
    }

    @DeleteMapping("/{studentId}/courses/{courseId}")
    public Mono<Void> dropCourse(@PathVariable int studentId, @PathVariable int courseId) {
        Map<String, Object> student = students.get(studentId);
        if (student != null) {
            @SuppressWarnings("unchecked")
            List<Integer> courses = (List<Integer>) student.get("courses");
            if (courses != null) {
                courses.remove(Integer.valueOf(courseId));
            }
        }
        return Mono.empty();
    }
}
