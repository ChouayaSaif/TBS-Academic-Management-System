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
package org.springframework.samples.petclinic.vets.web;

import java.util.List;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.samples.petclinic.vets.model.Professor;
import org.springframework.samples.petclinic.vets.model.ProfessorRepository;
import org.springframework.web.bind.annotation.*;

/**
 * Professor REST controller
 *
 * @author Juergen Hoeller
 * @author Mark Fisher
 * @author Ken Krebs
 * @author Arjen Poutsma
 * @author Maciej Szarlinski
 */
@RequestMapping("/professors")
@RestController
class ProfessorResource {

    private final ProfessorRepository professorRepository;

    ProfessorResource(ProfessorRepository professorRepository) {
        this.professorRepository = professorRepository;
    }

    @GetMapping
    @Cacheable("professors")
    public List<Professor> showResourcesProfessorList() {
        return professorRepository.findAll();
    }

    @GetMapping("/department/{department}")
    public List<Professor> getProfessorsByDepartment(@PathVariable("department") String department) {
        return professorRepository.findByDepartment(department);
    }

    @GetMapping("/specialty/{specialtyName}")
    public List<Professor> getProfessorsBySpecialty(@PathVariable("specialtyName") String specialtyName) {
        return professorRepository.findBySpecialtyName(specialtyName);
    }

    @GetMapping("/{professorId}")
    public Professor getProfessor(@PathVariable("professorId") int professorId) {
        return professorRepository.findById(professorId)
            .orElseThrow(() -> new IllegalArgumentException("Professor " + professorId + " not found"));
    }
}
