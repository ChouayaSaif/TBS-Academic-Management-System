'use strict';

var universityApp = angular.module('universityApp', ['ui.router']);

// ==================== SERVICES ====================

// Auth Service with OAuth 2.0 and Email Verification
universityApp.factory('AuthService', ['$q', '$timeout', function($q, $timeout) {
    var currentUser = null;
    var registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || {};
    var verifiedEmails = JSON.parse(localStorage.getItem('verifiedEmails')) || {};

    // Pre-populate with demo users
    if (Object.keys(registeredUsers).length === 0) {
        registeredUsers = {
            'student@tbs.edu': { id: 1, name: 'Ahmed Ben Ali', email: 'student@tbs.edu', password: 'password', role: 'student', department: 'Computer Science', studentId: 'STU001', verified: true },
            'professor@tbs.edu': { id: 1, name: 'Dr. Sarah Johnson', email: 'professor@tbs.edu', password: 'password', role: 'professor', professorId: 1, department: 'Computer Science', verified: true },
            'admin@tbs.edu': { id: 100, name: 'Admin User', email: 'admin@tbs.edu', password: 'password', role: 'admin', verified: true }
        };
        verifiedEmails = {
            'student@tbs.edu': true,
            'professor@tbs.edu': true,
            'admin@tbs.edu': true
        };
    }

    return {
        // Register a new user
        register: function(userData) {
            if (registeredUsers[userData.email]) {
                return { success: false, message: 'Email already registered' };
            }

            var newUser = {
                id: Date.now(), // Use timestamp to avoid collision with static data
                name: userData.name,
                email: userData.email,
                password: userData.password,
                role: userData.role,
                department: userData.department || '',
                studentId: userData.role === 'student' ? 'STU' + Math.floor(Math.random() * 10000) : '',
                professorId: userData.role === 'professor' ? Date.now() : '',
                verified: false,
                enrolledCourses: [],
                createdAt: new Date().toISOString()
            };

            registeredUsers[userData.email] = newUser;
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

            // Simulate email verification code
            var verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            localStorage.setItem('verificationCode_' + userData.email, verificationCode);

            return {
                success: true,
                message: 'Registration successful. Verification code sent to ' + userData.email,
                verificationCode: verificationCode // For demo purposes
            };
        },

        // Verify email with code
        verifyEmail: function(email, code) {
            var storedCode = localStorage.getItem('verificationCode_' + email);
            if (storedCode === code) {
                if (registeredUsers[email]) {
                    registeredUsers[email].verified = true;
                    verifiedEmails[email] = true;
                    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
                    localStorage.setItem('verifiedEmails', JSON.stringify(verifiedEmails));
                    localStorage.removeItem('verificationCode_' + email);
                    return { success: true, message: 'Email verified successfully' };
                }
            }
            return { success: false, message: 'Invalid verification code' };
        },

        // Resend verification code
        resendVerificationCode: function(email) {
            if (!registeredUsers[email]) {
                return { success: false, message: 'Email not found' };
            }
            var verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            localStorage.setItem('verificationCode_' + email, verificationCode);
            return {
                success: true,
                message: 'Verification code resent to ' + email,
                verificationCode: verificationCode
            };
        },

        // OAuth 2.0 Login simulation
        loginWithOAuth: function(provider) {
            var deferred = $q.defer();
            // Simulate OAuth flow
            $timeout(function() {
                var oauthUser = {
                    id: Date.now(),
                    name: 'OAuth User ' + provider,
                    email: 'oauth.' + provider + '@tbs.edu',
                    role: 'student',
                    department: 'Computer Science',
                    oauthProvider: provider,
                    verified: true
                };
                currentUser = oauthUser;
                localStorage.setItem('currentUser', JSON.stringify(oauthUser));
                deferred.resolve(oauthUser);
            }, 500);
            return deferred.promise;
        },

        // Standard login
        login: function(email, password) {
            var user = registeredUsers[email];
            if (user && user.password === password) {
                if (!user.verified) {
                    return { success: false, message: 'Please verify your email first', requiresVerification: true };
                }
                currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(user));
                return { success: true, user: user };
            }
            return { success: false, message: 'Invalid email or password' };
        },

        logout: function() {
            currentUser = null;
            localStorage.removeItem('currentUser');
        },

        getCurrentUser: function() {
            if (!currentUser) {
                var stored = localStorage.getItem('currentUser');
                if (stored) {
                    currentUser = JSON.parse(stored);
                }
            }
            return currentUser;
        },

        isLoggedIn: function() {
            return this.getCurrentUser() !== null;
        },

        hasRole: function(role) {
            var user = this.getCurrentUser();
            return user && user.role === role;
        },

        getRegisteredUsers: function() {
            return registeredUsers;
        },

        updateUser: function(user) {
            if (currentUser && currentUser.email === user.email) {
                currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
            if (registeredUsers[user.email]) {
                registeredUsers[user.email] = user;
                localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
            }
        }
    };
}]);

// Email Service (Simulated)
universityApp.factory('EmailService', ['$q', '$timeout', function($q, $timeout) {
    return {
        sendVerificationEmail: function(email, code) {
            var deferred = $q.defer();
            $timeout(function() {
                console.log('Verification email sent to:', email, 'Code:', code);
                deferred.resolve({ success: true });
            }, 500);
            return deferred.promise;
        }
    };
}]);

// Data Service
universityApp.factory('DataService', function() {
    var courses = [
        // Freshman Level
        { id: 1, code: 'BCOR 100', name: 'TBS Organization Seminar', department: 'Management', professorId: 5, professorName: 'Dr. Lisa Chen', credits: 0, capacity: 100, enrolled: 80, schedule: 'Fri 14:00-16:00', room: 'Auditorium', description: 'Orientation seminar for new students', minGPA: 0.0 },
        { id: 2, code: 'BCOR 110', name: 'Calculus for Business', department: 'Mathematics', professorId: 6, professorName: 'Dr. Karim Ben Salem', credits: 3, capacity: 40, enrolled: 35, schedule: 'Mon/Wed 09:00-10:30', room: 'F101', description: 'Calculus concepts for business applications', minGPA: 0.0 },
        { id: 3, code: 'BCOR 111', name: 'Linear Algebra for Business', department: 'Mathematics', professorId: 6, professorName: 'Dr. Karim Ben Salem', credits: 3, capacity: 40, enrolled: 30, schedule: 'Tue/Thu 09:00-10:30', room: 'F102', description: 'Matrix algebra and linear systems', minGPA: 0.0 },
        { id: 4, code: 'BCOR 120', name: 'Principles of Management', department: 'Management', professorId: 5, professorName: 'Dr. Lisa Chen', credits: 3, capacity: 50, enrolled: 45, schedule: 'Mon/Wed 11:00-12:30', room: 'E101', description: 'Fundamentals of management theory', minGPA: 0.0 },
        { id: 5, code: 'BCOR 130', name: 'Financial Accounting', department: 'Finance', professorId: 2, professorName: 'Dr. Mohamed Trabelsi', credits: 3, capacity: 45, enrolled: 40, schedule: 'Tue/Thu 11:00-12:30', room: 'B201', description: 'Introduction to financial accounting', minGPA: 0.0 },
        { id: 6, code: 'BCOR 140', name: 'Introduction to Microeconomics', department: 'Economics', professorId: 4, professorName: 'Dr. Ahmed Mansour', credits: 3, capacity: 50, enrolled: 48, schedule: 'Mon/Wed 14:00-15:30', room: 'D101', description: 'Microeconomic principles', minGPA: 0.0 },
        { id: 7, code: 'BCOR 150', name: 'Probability & Statistics I', department: 'Mathematics', professorId: 6, professorName: 'Dr. Karim Ben Salem', credits: 3, capacity: 45, enrolled: 42, schedule: 'Tue/Thu 14:00-15:30', room: 'F101', description: 'Introductory statistics for business', minGPA: 0.0 },
        { id: 8, code: 'NBC 100', name: 'Intensive General English', department: 'Management', professorId: 3, professorName: 'Dr. Emma Williams', credits: 3, capacity: 30, enrolled: 25, schedule: 'Mon/Wed 08:00-09:30', room: 'C101', description: 'English language proficiency', minGPA: 0.0 },
        { id: 9, code: 'NBC 101', name: 'Debating Skills', department: 'Management', professorId: 3, professorName: 'Dr. Emma Williams', credits: 1, capacity: 25, enrolled: 20, schedule: 'Fri 09:00-10:00', room: 'C102', description: 'Development of argumentation skills', minGPA: 0.0 },
        { id: 10, code: 'NBC 110', name: 'French I', department: 'Management', professorId: 5, professorName: 'Dr. Lisa Chen', credits: 1, capacity: 30, enrolled: 15, schedule: 'Fri 10:30-11:30', room: 'E102', description: 'Introductory French (Optional)', minGPA: 0.0 },
        { id: 11, code: 'NBC 120', name: 'English Communication Skills', department: 'Management', professorId: 3, professorName: 'Dr. Emma Williams', credits: 2, capacity: 30, enrolled: 28, schedule: 'Tue 16:00-18:00', room: 'C101', description: 'Oral and written communication', minGPA: 0.0 },
        { id: 12, code: 'CS 100', name: 'Algo & Initiation to Programming', department: 'Computer Science', professorId: 1, professorName: 'Dr. Sarah Johnson', credits: 3, capacity: 40, enrolled: 38, schedule: 'Mon/Wed 10:30-12:00', room: 'A101', description: 'Programming logic and basics', minGPA: 0.0 },
        { id: 13, code: 'CS 120', name: 'Database Design & Management', department: 'Computer Science', professorId: 1, professorName: 'Dr. Sarah Johnson', credits: 3, capacity: 35, enrolled: 30, schedule: 'Tue/Thu 10:30-12:00', room: 'A105', description: 'Relational databases and SQL', minGPA: 0.0 },

        // Sophomore Level
        { id: 14, code: 'BCOR 200', name: 'Intro to MIS', department: 'Management', professorId: 1, professorName: 'Dr. Sarah Johnson', credits: 3, capacity: 40, enrolled: 35, schedule: 'Mon/Wed 14:00-15:30', room: 'A102', description: 'Management Information Systems', minGPA: 2.0 },
        { id: 15, code: 'BCOR 210', name: 'Fundamentals of Marketing', department: 'Marketing', professorId: 3, professorName: 'Dr. Emma Williams', credits: 3, capacity: 45, enrolled: 40, schedule: 'Tue/Thu 09:00-10:30', room: 'C101', description: 'Marketing principles and strategy', minGPA: 2.0 },
        { id: 16, code: 'BCOR 225', name: 'Managerial Accounting', department: 'Finance', professorId: 2, professorName: 'Dr. Mohamed Trabelsi', credits: 3, capacity: 40, enrolled: 36, schedule: 'Mon/Wed 16:00-17:30', room: 'B202', description: 'Accounting for decision making', minGPA: 2.0 },
        { id: 17, code: 'BCOR 230', name: 'Business Optimization', department: 'Management', professorId: 6, professorName: 'Dr. Karim Ben Salem', credits: 3, capacity: 35, enrolled: 30, schedule: 'Tue/Thu 14:00-15:30', room: 'F102', description: 'Optimization methods for business', minGPA: 2.0 },
        { id: 18, code: 'BCOR 240', name: 'Intro to Macroeconomics', department: 'Economics', professorId: 4, professorName: 'Dr. Ahmed Mansour', credits: 3, capacity: 45, enrolled: 42, schedule: 'Fri 09:00-12:00', room: 'D102', description: 'Macroeconomic theory and policy', minGPA: 2.0 },
        { id: 19, code: 'BCOR 250', name: 'Probability & Statistics II', department: 'Mathematics', professorId: 6, professorName: 'Dr. Karim Ben Salem', credits: 3, capacity: 35, enrolled: 28, schedule: 'Mon/Wed 09:00-10:30', room: 'F105', description: 'Advanced statistics', minGPA: 2.0 },
        { id: 20, code: 'BCOR 260', name: 'Principles of Finance', department: 'Finance', professorId: 2, professorName: 'Dr. Mohamed Trabelsi', credits: 3, capacity: 40, enrolled: 38, schedule: 'Tue/Thu 11:00-12:30', room: 'B205', description: 'Financial markets and valuation', minGPA: 2.0 },
        { id: 21, code: 'BCOR 270', name: 'Business Law', department: 'Management', professorId: 5, professorName: 'Dr. Lisa Chen', credits: 3, capacity: 50, enrolled: 45, schedule: 'Mon/Wed 12:30-14:00', room: 'E105', description: 'Legal environment of business', minGPA: 2.0 },
        { id: 22, code: 'NBC 130', name: 'French II', department: 'Management', professorId: 5, professorName: 'Dr. Lisa Chen', credits: 1, capacity: 30, enrolled: 12, schedule: 'Fri 14:00-15:00', room: 'E102', description: 'Intermediate French (Optional)', minGPA: 0.0 },
        { id: 23, code: 'NBC 200', name: 'Business English', department: 'Management', professorId: 3, professorName: 'Dr. Emma Williams', credits: 2, capacity: 30, enrolled: 29, schedule: 'Tue 14:00-16:00', room: 'C105', description: 'Professional business communication', minGPA: 0.0 },
        { id: 24, code: 'NBC 210', name: 'Technical Writing', department: 'Management', professorId: 3, professorName: 'Dr. Emma Williams', credits: 2, capacity: 30, enrolled: 25, schedule: 'Thu 14:00-16:00', room: 'C106', description: 'Technical documentation and reporting', minGPA: 0.0 },
        { id: 25, code: 'CS 200', name: 'Web Development', department: 'Computer Science', professorId: 1, professorName: 'Dr. Sarah Johnson', credits: 3, capacity: 35, enrolled: 33, schedule: 'Fri 09:00-12:00', room: 'A103', description: 'Full stack web development', minGPA: 2.0 },
        { id: 26, code: 'CS 220', name: 'Object-Oriented Programming', department: 'Computer Science', professorId: 1, professorName: 'Dr. Sarah Johnson', credits: 3, capacity: 35, enrolled: 30, schedule: 'Tue/Thu 16:00-17:30', room: 'A104', description: 'Advanced OOP concepts', minGPA: 2.0 },

        // Senior/Junior & Electives
        { id: 27, code: 'NBC 300', name: 'Reporting Skills', department: 'Management', professorId: 3, professorName: 'Dr. Emma Williams', credits: 1, capacity: 40, enrolled: 35, schedule: 'Fri 16:00-17:00', room: 'C101', description: 'Professional reporting techniques', minGPA: 2.0 },
        { id: 28, code: 'SEN 400', name: 'Full-time Internship', department: 'Management', professorId: 5, professorName: 'Dr. Lisa Chen', credits: 12, capacity: 100, enrolled: 50, schedule: 'Arranged', room: 'Off-campus', description: 'Senior full-time internship', minGPA: 2.5 },
        { id: 29, code: 'SEN 401', name: 'Senior Project', department: 'Computer Science', professorId: 1, professorName: 'Dr. Sarah Johnson', credits: 6, capacity: 50, enrolled: 45, schedule: 'Arranged', room: 'Lab A', description: 'Capstone senior project', minGPA: 2.5 }
    ];

    var professors = [
        { id: 1, name: 'Dr. Sarah Johnson', email: 'sarah.johnson@tbs.edu', department: 'Computer Science', specialties: ['Machine Learning', 'Data Science'], office: 'Building A, Room 301', phone: '+216 XX XXX XXX' },
        { id: 2, name: 'Dr. Mohamed Trabelsi', email: 'mohamed.trabelsi@tbs.edu', department: 'Finance', specialties: ['Finance', 'Economics'], office: 'Building B, Room 205', phone: '+216 XX XXX XXX' },
        { id: 3, name: 'Dr. Emma Williams', email: 'emma.williams@tbs.edu', department: 'Marketing', specialties: ['Marketing', 'Business Strategy'], office: 'Building C, Room 102', phone: '+216 XX XXX XXX' },
        { id: 4, name: 'Dr. Ahmed Mansour', email: 'ahmed.mansour@tbs.edu', department: 'Economics', specialties: ['Microeconomics', 'Macroeconomics'], office: 'Building D, Room 150', phone: '+216 XX XXX XXX' },
        { id: 5, name: 'Dr. Lisa Chen', email: 'lisa.chen@tbs.edu', department: 'Management', specialties: ['Strategic Management', 'Operations'], office: 'Building E, Room 210', phone: '+216 XX XXX XXX' },
        { id: 6, name: 'Dr. Karim Ben Salem', email: 'karim.bensalem@tbs.edu', department: 'Mathematics', specialties: ['Statistics', 'Applied Mathematics'], office: 'Building F, Room 115', phone: '+216 XX XXX XXX' }
    ];

    var students = [
        { id: 1, name: 'Ahmed Ben Ali', email: 'ahmed.benali@tbs.edu', studentId: 'STU001', department: 'Computer Science', enrolledCourses: [1, 2, 7, 11], semester: 'Fall 2026', gpa: 3.5, phone: '+216 XX XXX XXX', address: 'Tunis, Tunisia' },
        { id: 2, name: 'Fatma Hammami', email: 'fatma.hammami@tbs.edu', studentId: 'STU002', department: 'Finance', enrolledCourses: [3, 4, 7, 9], semester: 'Fall 2026', gpa: 3.8, phone: '+216 XX XXX XXX', address: 'Tunis, Tunisia' },
        { id: 3, name: 'Youssef Gharbi', email: 'youssef.gharbi@tbs.edu', studentId: 'STU003', department: 'Marketing', enrolledCourses: [5, 6, 9, 10], semester: 'Fall 2026', gpa: 3.2, phone: '+216 XX XXX XXX', address: 'Tunis, Tunisia' },
        { id: 4, name: 'Amira Mejri', email: 'amira.mejri@tbs.edu', studentId: 'STU004', department: 'Economics', enrolledCourses: [7, 8, 3, 11], semester: 'Fall 2026', gpa: 3.6, phone: '+216 XX XXX XXX', address: 'Tunis, Tunisia' },
        { id: 5, name: 'Khaled Sassi', email: 'khaled.sassi@tbs.edu', studentId: 'STU005', department: 'Management', enrolledCourses: [9, 10, 5, 8], semester: 'Fall 2026', gpa: 3.1, phone: '+216 XX XXX XXX', address: 'Tunis, Tunisia' }
    ];

    return {
        getCourses: function() { return courses; },
        getCourse: function(id) { return courses.find(c => c.id === id); },
        getProfessors: function() { return professors; },
        getProfessor: function(id) { return professors.find(p => p.id === id); },
        getStudents: function() { return students; },
        getStudent: function(id) { return students.find(s => s.id === id); },
        getDepartments: function() { return ['Computer Science', 'Finance', 'Marketing', 'Economics', 'Management', 'Mathematics']; },

        updateCourse: function(course) {
            var idx = courses.findIndex(c => c.id === course.id);
            if (idx !== -1) courses[idx] = course;
        },
        addCourse: function(course) {
            course.id = courses.length + 1;
            course.enrolled = 0;
            courses.push(course);
            return course;
        },
        deleteCourse: function(id) {
            var idx = courses.findIndex(c => c.id === id);
            if (idx !== -1) courses.splice(idx, 1);
        },

        enrollStudent: function(student, courseId) {
            // Accept student object instead of ID to support new users
            var course = courses.find(c => c.id === courseId);
            if (student && course && !student.enrolledCourses.includes(courseId)) {
                if (course.enrolled < course.capacity) {
                    student.enrolledCourses.push(courseId);
                    course.enrolled++;
                    return true;
                }
            }
            return false;
        },

        dropCourse: function(student, courseId) {
            // Accept student object instead of ID to support new users
            var course = courses.find(c => c.id === courseId);
            if (student && course) {
                var idx = student.enrolledCourses.indexOf(courseId);
                if (idx !== -1) {
                    student.enrolledCourses.splice(idx, 1);
                    course.enrolled--;
                    return true;
                }
            }
            return false;
        },

        getProfessorCourses: function(professorId) {
            return courses.filter(c => c.professorId === professorId);
        },

        getCourseStudents: function(courseId) {
            return students.filter(s => s.enrolledCourses.includes(courseId));
        },

        addStudent: function(student) {
            student.id = students.length + 1;
            student.enrolledCourses = [];
            student.gpa = 3.0;
            students.push(student);
            return student;
        },

        updateStudent: function(student) {
            var idx = students.findIndex(s => s.id === student.id);
            if (idx !== -1) students[idx] = student;
        },

        deleteStudent: function(id) {
            var idx = students.findIndex(s => s.id === id);
            if (idx !== -1) students.splice(idx, 1);
        },

        addProfessor: function(professor) {
            professor.id = professors.length + 1;
            professors.push(professor);
            return professor;
        },

        updateProfessor: function(professor) {
            var idx = professors.findIndex(p => p.id === professor.id);
            if (idx !== -1) professors[idx] = professor;
        },

        deleteProfessor: function(id) {
            var idx = professors.findIndex(p => p.id === id);
            if (idx !== -1) professors.splice(idx, 1);
        }
    };
});

// ==================== CONFIG ====================

universityApp.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {

    $locationProvider.hashPrefix('!');
    $urlRouterProvider.otherwise('/login');

    $stateProvider
        // Auth Pages
        .state('login', {
            url: '/login',
            templateUrl: 'views/auth/login.html',
            controller: 'LoginController'
        })
        .state('register', {
            url: '/register',
            templateUrl: 'views/auth/register.html',
            controller: 'RegisterController'
        })
        .state('verify-email', {
            url: '/verify-email/:email',
            templateUrl: 'views/auth/verify-email.html',
            controller: 'VerifyEmailController'
        })

        // Student Dashboard
        .state('student', {
            abstract: true,
            url: '/student',
            template: '<ui-view/>'
        })
        .state('student.dashboard', {
            url: '/dashboard',
            templateUrl: 'views/student/dashboard.html',
            controller: 'StudentDashboardController'
        })
        .state('student.courses', {
            url: '/courses',
            templateUrl: 'views/student/courses.html',
            controller: 'StudentCoursesController'
        })
        .state('student.myCourses', {
            url: '/my-courses',
            templateUrl: 'views/student/my-courses.html',
            controller: 'StudentMyCoursesController'
        })
        .state('student.schedule', {
            url: '/schedule',
            templateUrl: 'views/student/schedule.html',
            controller: 'StudentScheduleController'
        })
        .state('student.profile', {
            url: '/profile',
            templateUrl: 'views/student/profile.html',
            controller: 'StudentProfileController'
        })

        // Professor Dashboard
        .state('professor', {
            abstract: true,
            url: '/professor',
            template: '<ui-view/>'
        })
        .state('professor.dashboard', {
            url: '/dashboard',
            templateUrl: 'views/professor/dashboard.html',
            controller: 'ProfessorDashboardController'
        })
        .state('professor.courses', {
            url: '/courses',
            templateUrl: 'views/professor/courses.html',
            controller: 'ProfessorCoursesController'
        })
        .state('professor.students', {
            url: '/students/:courseId',
            templateUrl: 'views/professor/students.html',
            controller: 'ProfessorStudentsController'
        })
        .state('professor.schedule', {
            url: '/schedule',
            templateUrl: 'views/professor/schedule.html',
            controller: 'ProfessorScheduleController'
        })
        .state('professor.profile', {
            url: '/profile',
            templateUrl: 'views/professor/profile.html',
            controller: 'ProfessorProfileController'
        })

        // Admin Dashboard
        .state('admin', {
            abstract: true,
            url: '/admin',
            template: '<ui-view/>'
        })
        .state('admin.dashboard', {
            url: '/dashboard',
            templateUrl: 'views/admin/dashboard.html',
            controller: 'AdminDashboardController'
        })
        .state('admin.courses', {
            url: '/courses',
            templateUrl: 'views/admin/courses.html',
            controller: 'AdminCoursesController'
        })
        .state('admin.students', {
            url: '/students',
            templateUrl: 'views/admin/students.html',
            controller: 'AdminStudentsController'
        })
        .state('admin.professors', {
            url: '/professors',
            templateUrl: 'views/admin/professors.html',
            controller: 'AdminProfessorsController'
        })
        .state('admin.reports', {
            url: '/reports',
            templateUrl: 'views/admin/reports.html',
            controller: 'AdminReportsController'
        });
}]);

// ==================== DIRECTIVES ====================

universityApp.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                    });
                }
                if (changeEvent.target.files[0]) {
                    reader.readAsDataURL(changeEvent.target.files[0]);
                }
            });
        }
    }
}]);

// ==================== CONTROLLERS ====================

// Login Controller
universityApp.controller('LoginController', ['$scope', '$state', 'AuthService', '$timeout', function($scope, $state, AuthService, $timeout) {
    $scope.credentials = { email: '', password: '' };
    $scope.error = null;
    $scope.loading = false;

    if (AuthService.isLoggedIn()) {
        var user = AuthService.getCurrentUser();
        $state.go(user.role + '.dashboard');
    }

    $scope.login = function() {
        $scope.loading = true;
        $scope.error = null;

        var result = AuthService.login($scope.credentials.email, $scope.credentials.password);
        if (result.success) {
            $state.go(result.user.role + '.dashboard');
        } else {
            $scope.error = result.message;
            if (result.requiresVerification) {
                // Optional: Automatically redirect to verification page or show link
                $timeout(function() {
                    $state.go('verify-email', { email: $scope.credentials.email });
                }, 1500);
            }
        }
        $scope.loading = false;
    };

    $scope.loginWithOAuth = function(provider) {
        $scope.loading = true;
        AuthService.loginWithOAuth(provider).then(function(user) {
            $state.go(user.role + '.dashboard');
        });
    };

    $scope.quickLogin = function(email, password) {
        $scope.credentials.email = email;
        $scope.credentials.password = password;
        $scope.login();
    };

    $scope.goToLogin = function() {
        $state.go('login');
    };

    $scope.goToRegister = function() {
        $state.go('register');
    };
}]);

// Register Controller
universityApp.controller('RegisterController', ['$scope', '$state', 'AuthService', function($scope, $state, AuthService) {
    $scope.formData = { role: 'student', department: 'Computer Science' };
    $scope.error = null;
    $scope.success = null;
    $scope.loading = false;
    $scope.departments = ['Computer Science', 'Finance', 'Marketing', 'Economics', 'Management', 'Mathematics'];

    $scope.register = function() {
        $scope.error = null;
        $scope.success = null;
        $scope.loading = true;

        if (!$scope.formData.name || !$scope.formData.email || !$scope.formData.password) {
            $scope.error = 'All fields are required';
            $scope.loading = false;
            return;
        }

        if ($scope.formData.password.length < 6) {
            $scope.error = 'Password must be at least 6 characters';
            $scope.loading = false;
            return;
        }

        var result = AuthService.register($scope.formData);
        if (result.success) {
            $scope.success = result.message;
            $state.go('verify-email', { email: $scope.formData.email });
        } else {
            $scope.error = result.message;
        }
        $scope.loading = false;
    };

    $scope.goToLogin = function() {
        $state.go('login');
    };

    $scope.loginWithOAuth = function(provider) {
        $scope.loading = true;
        AuthService.loginWithOAuth(provider).then(function(user) {
            $state.go(user.role + '.dashboard');
        });
    };
}]);

// Verify Email Controller
universityApp.controller('VerifyEmailController', ['$scope', '$state', '$stateParams', 'AuthService', function($scope, $state, $stateParams, AuthService) {
    $scope.email = $stateParams.email;
    $scope.verificationCode = '';
    $scope.error = null;
    $scope.success = null;
    $scope.loading = false;

    $scope.verify = function() {
        $scope.error = null;
        $scope.success = null;
        $scope.loading = true;

        var result = AuthService.verifyEmail($scope.email, $scope.verificationCode);
        if (result.success) {
            $scope.success = result.message;
            setTimeout(function() {
                $state.go('login');
            }, 2000);
        } else {
            $scope.error = result.message;
        }
        $scope.loading = false;
    };

    $scope.resendCode = function() {
        var result = AuthService.resendVerificationCode($scope.email);
        if (result.success) {
            $scope.success = 'Verification code resent to ' + $scope.email;
            console.log('New code for demo:', result.verificationCode);
        } else {
            $scope.error = result.message;
        }
    };

    $scope.goToLogin = function() {
        $state.go('login');
    };
}]);

// Student Dashboard Controller
universityApp.controller('StudentDashboardController', ['$scope', '$state', 'AuthService', 'DataService', function($scope, $state, AuthService, DataService) {
    if (!AuthService.hasRole('student')) {
        $state.go('login');
        return;
    }
    $scope.user = AuthService.getCurrentUser();

    // For new OAuth users, create temporary student entry
    if (!$scope.user.studentId) {
        $scope.user.studentId = 'STU' + Math.floor(Math.random() * 10000);
        $scope.user.gpa = 3.5;
        $scope.user.semester = 'Fall 2026';
    }

    $scope.student = DataService.getStudent($scope.user.id) || $scope.user;
    $scope.courses = DataService.getCourses();
    $scope.enrolledCourses = $scope.courses.filter(c => ($scope.student.enrolledCourses || []).includes(c.id));
    $scope.totalCredits = $scope.enrolledCourses.reduce((sum, c) => sum + c.credits, 0);

    // Graduation Progress
    $scope.graduationThreshold = 130;
    $scope.graduationProgress = Math.min(100, Math.round(($scope.totalCredits / $scope.graduationThreshold) * 100));

    $scope.logout = function() {
        AuthService.logout();
        $state.go('login');
    };
}]);

// Student Courses Controller
universityApp.controller('StudentCoursesController', ['$scope', '$state', 'AuthService', 'DataService', function($scope, $state, AuthService, DataService) {
    if (!AuthService.hasRole('student')) { $state.go('login'); return; }
    $scope.user = AuthService.getCurrentUser();
    $scope.student = DataService.getStudent($scope.user.id) || $scope.user;
    if (!$scope.student.enrolledCourses) $scope.student.enrolledCourses = [];

    $scope.courses = DataService.getCourses();
    $scope.departments = DataService.getDepartments();
    $scope.filterDept = '';
    $scope.searchQuery = '';
    $scope.message = null;

    $scope.filteredCourses = function() {
        return $scope.courses.filter(function(c) {
            var matchDept = !$scope.filterDept || c.department === $scope.filterDept;
            var matchSearch = !$scope.searchQuery || c.name.toLowerCase().includes($scope.searchQuery.toLowerCase()) || c.code.toLowerCase().includes($scope.searchQuery.toLowerCase());
            var notEnrolled = !$scope.student.enrolledCourses.includes(c.id);
            return matchDept && matchSearch && notEnrolled;
        });
    };

    $scope.getAvailableSlots = function(course) {
        return course.capacity - course.enrolled;
    };

    $scope.enrollCourse = function(course) {
        if ($scope.student.enrolledCourses.length >= 7) {
            $scope.message = { type: 'danger', text: 'You have reached the maximum of 7 courses' };
            return;
        }
        // Pass student object instead of ID
        if (DataService.enrollStudent($scope.student, course.id)) {
            // Update user persistence if this is the current user
            if ($scope.user.email === $scope.student.email) {
                AuthService.updateUser($scope.student);
            }
            $scope.message = { type: 'success', text: 'Successfully enrolled in ' + course.name };
            setTimeout(function() { $scope.$apply(function() { $scope.message = null; }); }, 3000);
        } else {
            $scope.message = { type: 'danger', text: 'Unable to enroll. Course may be full.' };
        }
    };

    $scope.logout = function() { AuthService.logout(); $state.go('login'); };
}]);

// Student My Courses Controller
universityApp.controller('StudentMyCoursesController', ['$scope', '$state', 'AuthService', 'DataService', function($scope, $state, AuthService, DataService) {
    if (!AuthService.hasRole('student')) { $state.go('login'); return; }
    $scope.user = AuthService.getCurrentUser();
    $scope.student = DataService.getStudent($scope.user.id) || $scope.user;
    if (!$scope.student.enrolledCourses) $scope.student.enrolledCourses = [];

    $scope.courses = DataService.getCourses();
    $scope.message = null;

    $scope.getEnrolledCourses = function() {
        return $scope.courses.filter(c => $scope.student.enrolledCourses.includes(c.id));
    };

    $scope.getTotalCredits = function() {
        return $scope.getEnrolledCourses().reduce((sum, c) => sum + c.credits, 0);
    };

    $scope.dropCourse = function(courseId) {
        if (confirm('Are you sure you want to drop this course?')) {
            // Pass student object instead of ID
            if (DataService.dropCourse($scope.student, courseId)) {
                // Update user persistence if this is the current user
                if ($scope.user.email === $scope.student.email) {
                    AuthService.updateUser($scope.student);
                }
                $scope.message = { type: 'info', text: 'Course dropped successfully' };
                setTimeout(() => { $scope.$apply(() => { $scope.message = null; }); }, 3000);
            }
        }
    };

    $scope.logout = function() { AuthService.logout(); $state.go('login'); };
}]);

// Student Schedule Controller
universityApp.controller('StudentScheduleController', ['$scope', '$state', 'AuthService', 'DataService', function($scope, $state, AuthService, DataService) {
    if (!AuthService.hasRole('student')) { $state.go('login'); return; }
    $scope.user = AuthService.getCurrentUser();
    $scope.student = DataService.getStudent($scope.user.id) || $scope.user;
    if (!$scope.student.enrolledCourses) $scope.student.enrolledCourses = [];

    $scope.courses = DataService.getCourses();
    $scope.enrolledCourses = $scope.courses.filter(c => $scope.student.enrolledCourses.includes(c.id));

    $scope.logout = function() { AuthService.logout(); $state.go('login'); };
}]);

// Student Profile Controller
universityApp.controller('StudentProfileController', ['$scope', '$state', 'AuthService', 'DataService', function($scope, $state, AuthService, DataService) {
    if (!AuthService.hasRole('student')) { $state.go('login'); return; }
    $scope.user = AuthService.getCurrentUser();
    $scope.student = DataService.getStudent($scope.user.id) || $scope.user;
    if (!$scope.student.enrolledCourses) $scope.student.enrolledCourses = [];

    $scope.courses = DataService.getCourses();
    $scope.enrolledCourses = $scope.courses.filter(c => $scope.student.enrolledCourses.includes(c.id));

    // Edit Profile Logic
    $scope.isEditing = false;
    $scope.tempUser = {};

    $scope.enableEdit = function() {
        $scope.tempUser = angular.copy($scope.student);
        $scope.isEditing = true;
    };

    $scope.cancelEdit = function() {
        $scope.isEditing = false;
        $scope.tempUser = {};
    };

    $scope.saveProfile = function() {
        angular.extend($scope.student, $scope.tempUser);
        DataService.updateStudent($scope.student);
        if ($scope.user.email === $scope.student.email) {
            AuthService.updateUser($scope.student);
        }
        $scope.isEditing = false;
    };

    $scope.logout = function() { AuthService.logout(); $state.go('login'); };
}]);

// Professor Dashboard Controller
universityApp.controller('ProfessorDashboardController', ['$scope', '$state', 'AuthService', 'DataService', function($scope, $state, AuthService, DataService) {
    if (!AuthService.hasRole('professor')) { $state.go('login'); return; }
    $scope.user = AuthService.getCurrentUser();
    $scope.professor = DataService.getProfessor($scope.user.professorId) || $scope.user;
    $scope.courses = DataService.getProfessorCourses($scope.user.professorId);
    $scope.totalStudents = $scope.courses.reduce((sum, c) => sum + c.enrolled, 0);
    $scope.totalCourses = $scope.courses.length;

    $scope.logout = function() { AuthService.logout(); $state.go('login'); };
}]);

// Professor Courses Controller
universityApp.controller('ProfessorCoursesController', ['$scope', '$state', 'AuthService', 'DataService', function($scope, $state, AuthService, DataService) {
    if (!AuthService.hasRole('professor')) { $state.go('login'); return; }
    $scope.user = AuthService.getCurrentUser();
    $scope.courses = DataService.getProfessorCourses($scope.user.professorId);
    $scope.editingCourse = null;
    $scope.message = null;

    $scope.editCourse = function(course) {
        $scope.editingCourse = angular.copy(course);
    };

    $scope.saveCourse = function() {
        DataService.updateCourse($scope.editingCourse);
        $scope.courses = DataService.getProfessorCourses($scope.user.professorId);
        $scope.editingCourse = null;
        $scope.message = { type: 'success', text: 'Course updated successfully' };
    };

    $scope.cancelEdit = function() {
        $scope.editingCourse = null;
    };

    $scope.getEnrollmentRate = function(course) {
        return Math.round((course.enrolled / course.capacity) * 100);
    };

    $scope.logout = function() { AuthService.logout(); $state.go('login'); };
}]);

// Professor Students Controller
universityApp.controller('ProfessorStudentsController', ['$scope', '$state', '$stateParams', 'AuthService', 'DataService', function($scope, $state, $stateParams, AuthService, DataService) {
    if (!AuthService.hasRole('professor')) { $state.go('login'); return; }
    $scope.user = AuthService.getCurrentUser();
    $scope.courseId = parseInt($stateParams.courseId);
    $scope.course = DataService.getCourse($scope.courseId);
    $scope.students = DataService.getCourseStudents($scope.courseId);

    $scope.logout = function() { AuthService.logout(); $state.go('login'); };
}]);

// Professor Schedule Controller
universityApp.controller('ProfessorScheduleController', ['$scope', '$state', 'AuthService', 'DataService', function($scope, $state, AuthService, DataService) {
    if (!AuthService.hasRole('professor')) { $state.go('login'); return; }
    $scope.user = AuthService.getCurrentUser();
    $scope.courses = DataService.getProfessorCourses($scope.user.professorId);

    $scope.logout = function() { AuthService.logout(); $state.go('login'); };
}]);

// Professor Profile Controller
universityApp.controller('ProfessorProfileController', ['$scope', '$state', 'AuthService', 'DataService', function($scope, $state, AuthService, DataService) {
    if (!AuthService.hasRole('professor')) { $state.go('login'); return; }
    $scope.user = AuthService.getCurrentUser();
    $scope.professor = DataService.getProfessor($scope.user.professorId) || $scope.user;
    $scope.courses = DataService.getProfessorCourses($scope.user.professorId);

    // Edit Profile Logic
    $scope.isEditing = false;
    $scope.tempUser = {};

    $scope.enableEdit = function() {
        $scope.tempUser = angular.copy($scope.professor);
        $scope.isEditing = true;
    };

    $scope.cancelEdit = function() {
        $scope.isEditing = false;
        $scope.tempUser = {};
    };

    $scope.saveProfile = function() {
        angular.extend($scope.professor, $scope.tempUser);
        DataService.updateProfessor($scope.professor);
        if ($scope.user.email === $scope.professor.email) {
            AuthService.updateUser($scope.professor);
        }
        $scope.isEditing = false;
    };

    $scope.logout = function() { AuthService.logout(); $state.go('login'); };
}]);

// Admin Dashboard Controller
universityApp.controller('AdminDashboardController', ['$scope', '$state', 'AuthService', 'DataService', function($scope, $state, AuthService, DataService) {
    if (!AuthService.hasRole('admin')) { $state.go('login'); return; }
    $scope.user = AuthService.getCurrentUser();
    $scope.stats = {
        totalStudents: DataService.getStudents().length,
        totalProfessors: DataService.getProfessors().length,
        totalCourses: DataService.getCourses().length,
        departments: DataService.getDepartments().length
    };

    $scope.logout = function() { AuthService.logout(); $state.go('login'); };
}]);

// Admin Courses Controller
universityApp.controller('AdminCoursesController', ['$scope', '$state', 'AuthService', 'DataService', function($scope, $state, AuthService, DataService) {
    if (!AuthService.hasRole('admin')) { $state.go('login'); return; }
    $scope.user = AuthService.getCurrentUser();
    $scope.courses = DataService.getCourses();
    $scope.professors = DataService.getProfessors();
    $scope.departments = DataService.getDepartments();
    $scope.editingCourse = null;
    $scope.newCourse = {};
    $scope.showAddForm = false;
    $scope.message = null;

    $scope.editCourse = function(course) {
        $scope.editingCourse = angular.copy(course);
    };

    $scope.saveCourse = function() {
        DataService.updateCourse($scope.editingCourse);
        $scope.courses = DataService.getCourses();
        $scope.editingCourse = null;
        $scope.message = { type: 'success', text: 'Course updated' };
    };

    $scope.cancelEdit = function() {
        $scope.editingCourse = null;
    };

    $scope.deleteCourse = function(id) {
        if (confirm('Are you sure you want to delete this course?')) {
            DataService.deleteCourse(id);
            $scope.courses = DataService.getCourses();
            $scope.message = { type: 'info', text: 'Course deleted' };
        }
    };

    $scope.addCourse = function() {
        if (!$scope.newCourse.code || !$scope.newCourse.name || !$scope.newCourse.professorId) {
            $scope.message = { type: 'danger', text: 'Please fill in all fields' };
            return;
        }
        var prof = $scope.professors.find(p => p.id === parseInt($scope.newCourse.professorId));
        $scope.newCourse.professorName = prof ? prof.name : '';
        $scope.newCourse.enrolled = 0;
        DataService.addCourse($scope.newCourse);
        $scope.courses = DataService.getCourses();
        $scope.newCourse = {};
        $scope.showAddForm = false;
        $scope.message = { type: 'success', text: 'Course added successfully' };
    };

    $scope.logout = function() { AuthService.logout(); $state.go('login'); };
}]);

// Admin Students Controller
universityApp.controller('AdminStudentsController', ['$scope', '$state', 'AuthService', 'DataService', function($scope, $state, AuthService, DataService) {
    if (!AuthService.hasRole('admin')) { $state.go('login'); return; }
    $scope.user = AuthService.getCurrentUser();
    $scope.students = DataService.getStudents();
    $scope.courses = DataService.getCourses();
    $scope.departments = DataService.getDepartments();
    $scope.editingStudent = null;
    $scope.newStudent = {};
    $scope.showAddForm = false;
    $scope.message = null;

    $scope.getStudentCourses = function(student) {
        return $scope.courses.filter(c => student.enrolledCourses.includes(c.id));
    };

    $scope.editStudent = function(student) {
        $scope.editingStudent = angular.copy(student);
    };

    $scope.saveStudent = function() {
        DataService.updateStudent($scope.editingStudent);
        $scope.students = DataService.getStudents();
        $scope.editingStudent = null;
        $scope.message = { type: 'success', text: 'Student updated' };
    };

    $scope.deleteStudent = function(id) {
        if (confirm('Are you sure you want to delete this student?')) {
            DataService.deleteStudent(id);
            $scope.students = DataService.getStudents();
            $scope.message = { type: 'info', text: 'Student deleted' };
        }
    };

    $scope.addStudent = function() {
        if (!$scope.newStudent.name || !$scope.newStudent.email || !$scope.newStudent.department) {
            $scope.message = { type: 'danger', text: 'Please fill in all fields' };
            return;
        }
        $scope.newStudent.studentId = 'STU' + String(DataService.getStudents().length + 1).padStart(3, '0');
        $scope.newStudent.semester = 'Fall 2026';
        $scope.newStudent.gpa = 3.0;
        DataService.addStudent($scope.newStudent);
        $scope.students = DataService.getStudents();
        $scope.newStudent = {};
        $scope.showAddForm = false;
        $scope.message = { type: 'success', text: 'Student added successfully' };
    };

    $scope.logout = function() { AuthService.logout(); $state.go('login'); };
}]);

// Admin Professors Controller
universityApp.controller('AdminProfessorsController', ['$scope', '$state', 'AuthService', 'DataService', function($scope, $state, AuthService, DataService) {
    if (!AuthService.hasRole('admin')) { $state.go('login'); return; }
    $scope.user = AuthService.getCurrentUser();
    $scope.professors = DataService.getProfessors();
    $scope.courses = DataService.getCourses();
    $scope.departments = DataService.getDepartments();
    $scope.editingProfessor = null;
    $scope.newProfessor = {};
    $scope.showAddForm = false;
    $scope.message = null;

    $scope.getProfessorCourses = function(professor) {
        return $scope.courses.filter(c => c.professorId === professor.id);
    };

    $scope.editProfessor = function(professor) {
        $scope.editingProfessor = angular.copy(professor);
    };

    $scope.saveProfessor = function() {
        DataService.updateProfessor($scope.editingProfessor);
        $scope.professors = DataService.getProfessors();
        $scope.editingProfessor = null;
        $scope.message = { type: 'success', text: 'Professor updated' };
    };

    $scope.cancelEdit = function() {
        $scope.editingProfessor = null;
    };

    $scope.deleteProfessor = function(id) {
        if (confirm('Are you sure you want to delete this professor?')) {
            DataService.deleteProfessor(id);
            $scope.professors = DataService.getProfessors();
            $scope.message = { type: 'info', text: 'Professor deleted' };
        }
    };

    $scope.addProfessor = function() {
        if (!$scope.newProfessor.name || !$scope.newProfessor.email || !$scope.newProfessor.department) {
            $scope.message = { type: 'danger', text: 'Please fill in all fields' };
            return;
        }
        DataService.addProfessor($scope.newProfessor);
        $scope.professors = DataService.getProfessors();
        $scope.newProfessor = {};
        $scope.showAddForm = false;
        $scope.message = { type: 'success', text: 'Professor added successfully' };
    };

    $scope.logout = function() { AuthService.logout(); $state.go('login'); };
}]);

// Admin Reports Controller
universityApp.controller('AdminReportsController', ['$scope', '$state', 'AuthService', 'DataService', function($scope, $state, AuthService, DataService) {
    if (!AuthService.hasRole('admin')) { $state.go('login'); return; }
    $scope.user = AuthService.getCurrentUser();
    $scope.courses = DataService.getCourses();
    $scope.students = DataService.getStudents();
    $scope.professors = DataService.getProfessors();

    $scope.getEnrollmentRate = function(course) {
        return Math.round((course.enrolled / course.capacity) * 100);
    };

    $scope.getDepartmentStats = function() {
        var stats = {};
        DataService.getDepartments().forEach(function(dept) {
            var deptCourses = $scope.courses.filter(c => c.department === dept);
            stats[dept] = {
                courses: deptCourses.length,
                students: deptCourses.reduce((sum, c) => sum + c.enrolled, 0),
                totalCapacity: deptCourses.reduce((sum, c) => sum + c.capacity, 0)
            };
        });
        return stats;
    };

    $scope.logout = function() { AuthService.logout(); $state.go('login'); };
}]);

