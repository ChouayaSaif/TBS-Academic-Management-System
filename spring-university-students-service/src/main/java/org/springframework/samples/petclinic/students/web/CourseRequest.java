package org.springframework.samples.petclinic.customers.web;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

/**
 * @author mszarlinski@bravurasolutions.com on 2016-12-05.
 */
record CourseRequest(int id,
                     @Size(min = 1)
                     String title,
                     @Min(1)
                     int credits,
                     int typeId
) {

}
