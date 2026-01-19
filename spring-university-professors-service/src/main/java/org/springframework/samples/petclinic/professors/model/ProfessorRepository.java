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
package org.springframework.samples.petclinic.vets.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Repository class for <code>Professor</code> domain objects
 */
public interface ProfessorRepository extends JpaRepository<Professor, Integer> {

    /**
     * Find professors by department
     */
    List<Professor> findByDepartment(String department);

    /**
     * Find professors by specialty name
     */
    @Query("SELECT p FROM Professor p JOIN p.specialties s WHERE s.name = :specialtyName")
    List<Professor> findBySpecialtyName(@Param("specialtyName") String specialtyName);
}
