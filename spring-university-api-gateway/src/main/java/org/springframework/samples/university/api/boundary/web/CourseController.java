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

import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.*;

/**
 * REST Controller for Course operations
 */
@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final WebClient.Builder webClientBuilder;

    public CourseController(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    @GetMapping
    public Mono<List<Map<String, Object>>> getAllCourses(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String day) {

        // Return mock data for now - in production this would call exams-service
        List<Map<String, Object>> courses = generateMockCourses();

        // Filter by department if specified
        if (department != null && !department.isEmpty()) {
            courses = courses.stream()
                .filter(c -> department.equals(c.get("department")))
                .toList();
        }

        // Filter by day if specified
        if (day != null && !day.isEmpty()) {
            courses = courses.stream()
                .filter(c -> ((String)c.get("timeSlot")).contains(day))
                .toList();
        }

        return Mono.just(courses);
    }

    @GetMapping("/{courseId}")
    public Mono<Map<String, Object>> getCourse(@PathVariable int courseId) {
        List<Map<String, Object>> courses = generateMockCourses();
        return Mono.justOrEmpty(courses.stream()
            .filter(c -> courseId == (Integer)c.get("id"))
            .findFirst());
    }

    private List<Map<String, Object>> generateMockCourses() {
        List<Map<String, Object>> courses = new ArrayList<>();

        // Computer Science Courses
        courses.add(createCourse(1, "CS101", "Introduction to Programming", "Computer Science",
            "Dr. Smith", "Monday 09:00-10:30", "Room A101", 3, 25, 30));
        courses.add(createCourse(2, "CS201", "Data Structures", "Computer Science",
            "Dr. Johnson", "Tuesday 11:00-12:30", "Room A102", 4, 20, 25));
        courses.add(createCourse(3, "CS301", "Algorithms", "Computer Science",
            "Dr. Williams", "Wednesday 14:00-15:30", "Room A103", 4, 18, 25));
        courses.add(createCourse(4, "CS401", "Database Systems", "Computer Science",
            "Dr. Brown", "Thursday 09:00-10:30", "Room A104", 3, 22, 25));
        courses.add(createCourse(5, "CS402", "Software Engineering", "Computer Science",
            "Dr. Davis", "Friday 11:00-12:30", "Room A105", 3, 15, 30));

        // Mathematics Courses
        courses.add(createCourse(6, "MATH101", "Calculus I", "Mathematics",
            "Dr. Miller", "Monday 11:00-12:30", "Room B201", 4, 28, 35));
        courses.add(createCourse(7, "MATH201", "Linear Algebra", "Mathematics",
            "Dr. Wilson", "Tuesday 09:00-10:30", "Room B202", 3, 25, 30));
        courses.add(createCourse(8, "MATH301", "Probability & Statistics", "Mathematics",
            "Dr. Moore", "Wednesday 11:00-12:30", "Room B203", 3, 20, 25));

        // Physics Courses
        courses.add(createCourse(9, "PHY101", "Physics I - Mechanics", "Physics",
            "Dr. Taylor", "Monday 14:00-15:30", "Room C101", 4, 30, 35));
        courses.add(createCourse(10, "PHY201", "Physics II - Electromagnetism", "Physics",
            "Dr. Anderson", "Thursday 11:00-12:30", "Room C102", 4, 22, 30));

        // Chemistry Courses
        courses.add(createCourse(11, "CHEM101", "General Chemistry", "Chemistry",
            "Dr. Thomas", "Tuesday 14:00-15:30", "Room D101", 4, 25, 30));
        courses.add(createCourse(12, "CHEM201", "Organic Chemistry", "Chemistry",
            "Dr. Jackson", "Friday 09:00-10:30", "Room D102", 4, 18, 25));

        // Biology Courses
        courses.add(createCourse(13, "BIO101", "Introduction to Biology", "Biology",
            "Dr. White", "Wednesday 09:00-10:30", "Room E101", 3, 32, 35));
        courses.add(createCourse(14, "BIO201", "Genetics", "Biology",
            "Dr. Harris", "Thursday 14:00-15:30", "Room E102", 4, 20, 25));

        // Engineering Courses
        courses.add(createCourse(15, "ENG101", "Engineering Fundamentals", "Engineering",
            "Dr. Martin", "Monday 16:00-17:30", "Room F101", 3, 28, 30));
        courses.add(createCourse(16, "ENG201", "Thermodynamics", "Engineering",
            "Dr. Garcia", "Tuesday 16:00-17:30", "Room F102", 4, 22, 25));

        // Business Courses
        courses.add(createCourse(17, "BUS101", "Introduction to Business", "Business Administration",
            "Dr. Martinez", "Wednesday 16:00-17:30", "Room G101", 3, 35, 40));
        courses.add(createCourse(18, "BUS201", "Financial Accounting", "Business Administration",
            "Dr. Robinson", "Friday 14:00-15:30", "Room G102", 3, 30, 35));

        // Economics Courses
        courses.add(createCourse(19, "ECON101", "Microeconomics", "Economics",
            "Dr. Clark", "Thursday 16:00-17:30", "Room H101", 3, 25, 30));
        courses.add(createCourse(20, "ECON201", "Macroeconomics", "Economics",
            "Dr. Lewis", "Friday 16:00-17:30", "Room H102", 3, 22, 30));

        return courses;
    }

    private Map<String, Object> createCourse(int id, String code, String title, String department,
                                              String professorName, String timeSlot, String room,
                                              int credits, int enrolled, int capacity) {
        Map<String, Object> course = new HashMap<>();
        course.put("id", id);
        course.put("code", code);
        course.put("title", title);
        course.put("department", department);
        course.put("professorName", professorName);
        course.put("timeSlot", timeSlot);
        course.put("room", room);
        course.put("credits", credits);
        course.put("enrolled", enrolled);
        course.put("capacity", capacity);
        course.put("description", "Course description for " + title);
        return course;
    }
}

