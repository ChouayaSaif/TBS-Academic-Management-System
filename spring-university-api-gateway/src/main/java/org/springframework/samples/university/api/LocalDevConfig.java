/*
 * Configuration for local development mode
 */
package org.springframework.samples.university.api;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerResponse;

@Configuration
@Profile("local")
public class LocalDevConfig {

    @Bean
    public RouterFunction<ServerResponse> staticResourceRouter() {
        return RouterFunctions.resources("/**", new ClassPathResource("static/"));
    }
}

