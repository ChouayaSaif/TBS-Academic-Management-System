package org.springframework.samples.university.professors;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * Application principale du microservice Professors
 */
@EnableDiscoveryClient
@SpringBootApplication
public class ProfessorsServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProfessorsServiceApplication.class, args);
	}
}
