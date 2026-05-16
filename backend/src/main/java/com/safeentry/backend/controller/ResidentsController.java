package com.safeentry.backend.controller;

import com.safeentry.backend.exception.ResourceNotFoundException;
import com.safeentry.backend.model.Residents;
import com.safeentry.backend.repository.ResidentsRepository;
import com.safeentry.backend.service.ResidentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/")
public class ResidentsController {

    @Autowired
    private ResidentsRepository residentsRepository;

    @Autowired
    private ResidentService residentService;

    @PostMapping("/residents")
    public ResponseEntity<?> createResident(@Valid @RequestBody Residents resident) {
        try {
            Residents newResident = residentService.salvar(resident);
            return ResponseEntity.ok(newResident);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/residents")
    public List<Residents> getAllResidents() {
        return residentsRepository.findAll();
    }

    @GetMapping("/residents/{id}")
    public ResponseEntity<Residents> getResidentById(@PathVariable Long id) {
        Residents resident = residentsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resident not exist with id :" + id));
        return ResponseEntity.ok(resident);
    }

    @PutMapping("/residents/{id}")
    public ResponseEntity<?> updateResidents(@PathVariable Long id, @Valid @RequestBody Residents residentsInfo){
        try {
            Residents residents = residentsRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Residents not exist with id :" + id));

            residents.setName(residentsInfo.getName());
            residents.setLastName(residentsInfo.getLastName());
            residents.setDocument(residentsInfo.getDocument());
            residents.setResidence(residentsInfo.getResidence());

            Residents updatedResidents = residentService.salvar(residents);
            return ResponseEntity.ok(updatedResidents);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/residents/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteResidents(@PathVariable Long id){
        Residents residents = residentsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Residents not exist with id :" + id));

        residentsRepository.delete(residents);
        Map<String, Boolean> response = new HashMap<>();
        response.put("Resident deleted", Boolean.TRUE);

        return ResponseEntity.ok(response);
    }
}