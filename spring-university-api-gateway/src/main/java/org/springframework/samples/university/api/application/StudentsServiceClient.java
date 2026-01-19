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
package org.springframework.samples.university.api.application;

import org.springframework.samples.university.api.dto.StudentDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

/**
 * @author Maciej Szarlinski
 */
@Component
public class StudentsServiceClient {

    private final WebClient.Builder webClientBuilder;

    public StudentsServiceClient(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    public Mono<StudentDetails> getStudent(final int studentId) {
        return webClientBuilder.build().get()
            .uri("http://students-service/students/{studentId}", studentId)
            .retrieve()
            .bodyToMono(StudentDetails.class);
    }
}
