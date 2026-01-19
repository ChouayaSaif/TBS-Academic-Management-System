'use strict';

angular.module('studentDetails')
    .controller('StudentDetailsController', ['$http', '$state', '$stateParams', function($http, $state, $stateParams) {
        var self = this;
        self.student = null;
        self.loading = true;
        self.error = null;

        self.loadStudent = function() {
            self.loading = true;
            $http.get('/api/students/' + $stateParams.studentId).then(function(response) {
                self.student = response.data;
                self.loading = false;
            }).catch(function(error) {
                self.error = 'Failed to load student details';
                self.loading = false;
            });
        };

        self.editStudent = function() {
            $state.go('studentEdit', { studentId: $stateParams.studentId });
        };

        self.registerCourses = function() {
            $state.go('courseRegistration', { studentId: $stateParams.studentId });
        };

        self.dropCourse = function(courseId) {
            if (confirm('Are you sure you want to drop this course?')) {
                $http.delete('/api/students/' + $stateParams.studentId + '/courses/' + courseId)
                    .then(function() {
                        self.loadStudent();
                    }).catch(function(error) {
                        alert('Failed to drop course: ' + (error.data.message || 'Unknown error'));
                    });
            }
        };

        self.getCoursesCount = function() {
            return self.student && self.student.courses ? self.student.courses.length : 0;
        };

        self.canRegisterMore = function() {
            return self.getCoursesCount() < 7;
        };

        self.loadStudent();
    }]);

