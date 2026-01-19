'use strict';

angular.module('courseRegistration')
    .controller('CourseRegistrationController', ['$http', '$state', '$stateParams', function($http, $state, $stateParams) {
        var self = this;
        self.student = null;
        self.availableCourses = [];
        self.selectedCourses = [];
        self.loading = true;
        self.error = null;
        self.success = null;
        self.filterDepartment = '';

        self.MIN_COURSES = 6;
        self.MAX_COURSES = 7;

        self.departments = [
            'Computer Science', 'Mathematics', 'Physics', 'Chemistry',
            'Biology', 'Engineering', 'Business Administration', 'Economics'
        ];

        self.init = function() {
            self.loading = true;

            // Load student data
            $http.get('/api/students/' + $stateParams.studentId).then(function(response) {
                self.student = response.data;
                self.selectedCourses = self.student.courses ? self.student.courses.map(function(c) { return c.id; }) : [];
                return $http.get('/api/courses');
            }).then(function(response) {
                self.availableCourses = response.data;
                self.loading = false;
            }).catch(function(error) {
                self.error = 'Failed to load data';
                self.loading = false;
            });
        };

        self.isCourseSelected = function(courseId) {
            return self.selectedCourses.indexOf(courseId) !== -1;
        };

        self.toggleCourse = function(course) {
            var index = self.selectedCourses.indexOf(course.id);
            if (index === -1) {
                // Check max courses
                if (self.selectedCourses.length >= self.MAX_COURSES) {
                    alert('You can only register for maximum ' + self.MAX_COURSES + ' courses per semester.');
                    return;
                }
                // Check if course is full
                if (course.enrolled >= course.capacity) {
                    alert('This course is full. Please choose another one.');
                    return;
                }
                // Check time conflicts
                var conflict = self.checkTimeConflict(course);
                if (conflict) {
                    alert('Time conflict with: ' + conflict.title + ' (' + conflict.timeSlot + ')');
                    return;
                }
                self.selectedCourses.push(course.id);
            } else {
                self.selectedCourses.splice(index, 1);
            }
        };

        self.checkTimeConflict = function(newCourse) {
            for (var i = 0; i < self.selectedCourses.length; i++) {
                var selectedCourse = self.getCourseById(self.selectedCourses[i]);
                if (selectedCourse && selectedCourse.timeSlot === newCourse.timeSlot) {
                    return selectedCourse;
                }
            }
            return null;
        };

        self.getCourseById = function(courseId) {
            for (var i = 0; i < self.availableCourses.length; i++) {
                if (self.availableCourses[i].id === courseId) {
                    return self.availableCourses[i];
                }
            }
            return null;
        };

        self.getSelectedCoursesCount = function() {
            return self.selectedCourses.length;
        };

        self.getTotalCredits = function() {
            var total = 0;
            for (var i = 0; i < self.selectedCourses.length; i++) {
                var course = self.getCourseById(self.selectedCourses[i]);
                if (course) {
                    total += course.credits;
                }
            }
            return total;
        };

        self.canSubmit = function() {
            return self.selectedCourses.length >= self.MIN_COURSES && self.selectedCourses.length <= self.MAX_COURSES;
        };

        self.submitRegistration = function() {
            if (!self.canSubmit()) {
                alert('Please select between ' + self.MIN_COURSES + ' and ' + self.MAX_COURSES + ' courses.');
                return;
            }

            self.loading = true;
            self.error = null;

            $http.post('/api/students/' + $stateParams.studentId + '/courses', {
                courseIds: self.selectedCourses
            }).then(function(response) {
                self.success = 'Courses registered successfully!';
                self.loading = false;
                setTimeout(function() {
                    $state.go('studentDetails', { studentId: $stateParams.studentId });
                }, 1500);
            }).catch(function(error) {
                self.error = 'Failed to register courses: ' + (error.data.message || 'Unknown error');
                self.loading = false;
            });
        };

        self.cancel = function() {
            $state.go('studentDetails', { studentId: $stateParams.studentId });
        };

        self.getFilteredCourses = function() {
            if (!self.filterDepartment) {
                return self.availableCourses;
            }
            return self.availableCourses.filter(function(course) {
                return course.department === self.filterDepartment;
            });
        };

        self.init();
    }]);

