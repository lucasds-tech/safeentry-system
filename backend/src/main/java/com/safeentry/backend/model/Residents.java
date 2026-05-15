package com.safeentry.backend.model;

import jakarta.persistence.*;
import lombok.*;;

@Data
@Entity
@AllArgsConstructor
@Table(name = "residents")
public class Residents {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "lastName")
    private String lastName;

    @Column(name = "document")
    private String document;

    public Residents() {
    }

}


