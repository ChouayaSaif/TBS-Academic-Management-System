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
package org.springframework.samples.petclinic.visits.model;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Repository class for <code>Enrollment</code> domain objects
 *
 * @author Ken Krebs
 * @author Juergen Hoeller
 * @author Sam Brannen
 * @author Michael Isvy
 * @author Maciej Szarlinski
 */
public interface EnrollmentRepository extends JpaRepository<Enrollment, Integer> {

    List<Enrollment> findByStudentId(int studentId);

    List<Enrollment> findByStudentIdIn(Collection<Integer> studentIds);

    List<Enrollment> findByCourseId(int courseId);

    /**
     * Count enrollments by student ID for validation (max 7 courses per student)
     */
    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.studentId = :studentId")
    long countByStudentId(@Param("studentId") int studentId);

    /**
     * Check if student is already enrolled in a course (prevent duplicates)
     */
    boolean existsByStudentIdAndCourseId(int studentId, int courseId);
}
