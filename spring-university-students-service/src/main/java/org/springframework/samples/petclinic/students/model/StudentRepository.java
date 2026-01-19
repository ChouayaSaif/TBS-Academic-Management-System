package org.springframework.samples.petclinic.customers.model;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository class for <code>Student</code> domain objects
 */
public interface StudentRepository extends JpaRepository<Student, Integer> {
}
