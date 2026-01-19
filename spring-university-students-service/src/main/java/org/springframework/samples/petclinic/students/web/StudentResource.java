package org.springframework.samples.petclinic.customers.web;

import io.micrometer.core.annotation.Timed;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.samples.petclinic.customers.model.Student;
import org.springframework.samples.petclinic.customers.model.StudentRepository;
import org.springframework.samples.petclinic.customers.web.mapper.StudentEntityMapper;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * Student REST controller
 */
@RequestMapping("/students")
@RestController
@Timed("petclinic.student")
class StudentResource {

    private static final Logger log = LoggerFactory.getLogger(StudentResource.class);

    private final StudentRepository studentRepository;
    private final StudentEntityMapper studentEntityMapper;

    StudentResource(StudentRepository studentRepository, StudentEntityMapper studentEntityMapper) {
        this.studentRepository = studentRepository;
        this.studentEntityMapper = studentEntityMapper;
    }

    /**
     * Create Student
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Student createStudent(@Valid @RequestBody StudentRequest studentRequest) {
        Student student = studentEntityMapper.map(new Student(), studentRequest);
        return studentRepository.save(student);
    }

    /**
     * Read single Student
     */
    @GetMapping(value = "/{studentId}")
    public Optional<Student> findStudent(@PathVariable("studentId") @Min(1) int studentId) {
        return studentRepository.findById(studentId);
    }

    /**
     * Read List of Students
     */
    @GetMapping
    public List<Student> findAll() {
        return studentRepository.findAll();
    }

    /**
     * Update Student
     */
    @PutMapping(value = "/{studentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateStudent(@PathVariable("studentId") @Min(1) int studentId, @Valid @RequestBody StudentRequest studentRequest) {
        final Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student " + studentId + " not found"));

        studentEntityMapper.map(student, studentRequest);
        log.info("Saving student {}", student);
        studentRepository.save(student);
    }
}
