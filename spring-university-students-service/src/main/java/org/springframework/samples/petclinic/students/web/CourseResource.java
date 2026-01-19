package org.springframework.samples.petclinic.customers.web;

import io.micrometer.core.annotation.Timed;
import jakarta.validation.constraints.Min;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.samples.petclinic.customers.model.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Course REST controller
 */
@RestController
@Timed("petclinic.course")
class CourseResource {

    private static final Logger log = LoggerFactory.getLogger(CourseResource.class);
    private static final int MAX_COURSES_PER_STUDENT = 7;

    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;

    CourseResource(CourseRepository courseRepository, StudentRepository studentRepository) {
        this.courseRepository = courseRepository;
        this.studentRepository = studentRepository;
    }

    @GetMapping("/courseTypes")
    public List<CourseType> getCourseTypes() {
        return courseRepository.findCourseTypes();
    }

    @PostMapping("/students/{studentId}/courses")
    @ResponseStatus(HttpStatus.CREATED)
    public Course processCreationForm(
        @RequestBody CourseRequest courseRequest,
        @PathVariable("studentId") @Min(1) int studentId) {

        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("Student " + studentId + " not found"));

        // Validate max 7 courses per student
        long currentCoursesCount = courseRepository.countByStudentId(studentId);
        if (currentCoursesCount >= MAX_COURSES_PER_STUDENT) {
            throw new IllegalStateException("Student cannot register for more than " + MAX_COURSES_PER_STUDENT + " courses per semester");
        }

        final Course course = new Course();
        course.setStudent(student);
        return save(course, courseRequest);
    }

    @GetMapping("/students/{studentId}/courses")
    public List<Course> getStudentCourses(@PathVariable("studentId") @Min(1) int studentId) {
        return courseRepository.findByStudentId(studentId);
    }

    @PutMapping("/students/*/courses/{courseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void processUpdateForm(@RequestBody CourseRequest courseRequest) {
        int courseId = courseRequest.id();
        Course course = findCourseById(courseId);
        save(course, courseRequest);
    }

    private Course save(final Course course, final CourseRequest courseRequest) {
        course.setTitle(courseRequest.title());
        course.setCredits(courseRequest.credits());

        courseRepository.findCourseTypeById(courseRequest.typeId())
            .ifPresent(course::setType);

        log.info("Saving course {}", course);
        return courseRepository.save(course);
    }

    @GetMapping("students/*/courses/{courseId}")
    public CourseDetails findCourse(@PathVariable("courseId") int courseId) {
        Course course = findCourseById(courseId);
        return new CourseDetails(course);
    }

    @DeleteMapping("students/*/courses/{courseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCourse(@PathVariable("courseId") int courseId) {
        Course course = findCourseById(courseId);
        courseRepository.delete(course);
        log.info("Deleted course {}", course);
    }

    private Course findCourseById(int courseId) {
        return courseRepository.findById(courseId)
            .orElseThrow(() -> new ResourceNotFoundException("Course " + courseId + " not found"));
    }
}
