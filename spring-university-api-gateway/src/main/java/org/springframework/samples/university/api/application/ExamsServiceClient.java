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

import org.springframework.samples.university.api.dto.Exams;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

import static java.util.stream.Collectors.joining;

/**
 * @author Maciej Szarlinski
 */
@Component
public class ExamsServiceClient {

    // Peut être changé pour les tests
    private String hostname = "http://exams-service/";

    private final WebClient.Builder webClientBuilder;

    public ExamsServiceClient(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    public Mono<Exams> getExamsForCourses(final List<Integer> courseIds) {
        return webClientBuilder.build()
            .get()
            .uri(hostname + "courses/exams?courseId={courseId}", joinIds(courseIds))
            .retrieve()
            .bodyToMono(Exams.class);
    }

    private String joinIds(List<Integer> courseIds) {
        return courseIds.stream().map(Object::toString).collect(joining(","));
    }

    void setHostname(String hostname) {
        this.hostname = hostname;
    }
}
