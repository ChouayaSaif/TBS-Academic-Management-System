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

import org.springframework.cloud.client.circuitbreaker.ReactiveCircuitBreaker;
import org.springframework.cloud.client.circuitbreaker.ReactiveCircuitBreakerFactory;
import org.springframework.samples.university.api.application.StudentsServiceClient;
import org.springframework.samples.university.api.application.ExamsServiceClient;
import org.springframework.samples.university.api.dto.StudentDetails;
import org.springframework.samples.university.api.dto.Exams;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.function.Function;

/**
 * @author Maciej Szarlinski
 */
@RestController
@RequestMapping("/api/gateway")
public class ApiGatewayController {

    private final StudentsServiceClient studentsServiceClient;
    private final ExamsServiceClient examsServiceClient;
    private final ReactiveCircuitBreakerFactory cbFactory;

    public ApiGatewayController(StudentsServiceClient studentsServiceClient,
                                ExamsServiceClient examsServiceClient,
                                ReactiveCircuitBreakerFactory cbFactory) {
        this.studentsServiceClient = studentsServiceClient;
        this.examsServiceClient = examsServiceClient;
        this.cbFactory = cbFactory;
    }

    @GetMapping(value = "students/{studentId}")
    public Mono<StudentDetails> getStudentDetails(final @PathVariable int studentId) {
        return studentsServiceClient.getStudent(studentId)
            .flatMap(student ->
                examsServiceClient.getExamsForCourses(student.getCourseIds())
                    .transform(it -> {
                        ReactiveCircuitBreaker cb = cbFactory.create("getStudentDetails");
                        return cb.run(it, throwable -> emptyExamsForCourses());
                    })
                    .map(addExamsToStudent(student))
            );
    }

    private Function<Exams, StudentDetails> addExamsToStudent(StudentDetails student) {
        return exams -> {
            student.courses()
                .forEach(course -> course.exams()
                    .addAll(exams.items().stream()
                        .filter(e -> e.courseId() == course.id())
                        .toList())
                );
            return student;
        };
    }

    private Mono<Exams> emptyExamsForCourses() {
        return Mono.just(new Exams(List.of()));
    }
}
