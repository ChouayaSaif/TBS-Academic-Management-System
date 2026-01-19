package org.springframework.samples.petclinic.customers.model;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Repository class for <code>Course</code> domain objects.
 */
public interface CourseRepository extends JpaRepository<Course, Integer> {

    /**
     * Retrieve all {@link CourseType}s from the data store.
     * @return a Collection of {@link CourseType}s.
     */
    @Query("SELECT ctype FROM CourseType ctype ORDER BY ctype.name")
    List<CourseType> findCourseTypes();

    @Query("FROM CourseType ctype WHERE ctype.id = :typeId")
    Optional<CourseType> findCourseTypeById(@Param("typeId") int typeId);

    /**
     * Count courses by student ID for validation (max 7 courses per student)
     */
    @Query("SELECT COUNT(c) FROM Course c WHERE c.student.id = :studentId")
    long countByStudentId(@Param("studentId") int studentId);

    /**
     * Find courses by student ID
     */
    @Query("FROM Course c WHERE c.student.id = :studentId")
    List<Course> findByStudentId(@Param("studentId") int studentId);
}
