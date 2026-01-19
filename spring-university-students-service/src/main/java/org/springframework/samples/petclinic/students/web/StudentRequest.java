package org.springframework.samples.petclinic.customers.web;

import jakarta.validation.constraints.NotBlank;

public record StudentRequest(@NotBlank String firstName,
                             @NotBlank String lastName,
                             @NotBlank String studentId,
                             String email,
                             String department) {
}
