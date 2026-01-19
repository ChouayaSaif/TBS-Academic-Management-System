package org.springframework.samples.petclinic.customers.web.mapper;

import org.springframework.samples.petclinic.customers.model.Student;
import org.springframework.samples.petclinic.customers.web.StudentRequest;
import org.springframework.stereotype.Component;

@Component
public class StudentEntityMapper implements Mapper<StudentRequest, Student> {
    // This is done by hand for simplicity purpose. In a real life use-case we should consider using MapStruct.
    @Override
    public Student map(final Student student, final StudentRequest request) {
        student.setStudentId(request.studentId());
        student.setEmail(request.email());
        student.setDepartment(request.department());
        student.setFirstName(request.firstName());
        student.setLastName(request.lastName());
        return student;
    }
}
