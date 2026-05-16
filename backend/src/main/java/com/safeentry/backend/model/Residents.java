package com.safeentry.backend.model;

import jakarta.persistence.*;
import lombok.*;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.NotBlank;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "residents")
public class Residents {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "The name is required.")
    @Column(name = "name")
    private String name;

    @NotBlank(message = "The lastName is required.")
    @Column(name = "lastName")
    private String lastName;

    @NotBlank(message = "O documento é obrigatório.")
    @Pattern(regexp = "\\d+", message = "The document must contain only numbers.")
    @Column(name = "document")
    private String document;

    @NotBlank(message = "The residence is required.")
    @Column(name = "residence")
    private String residence;

}


