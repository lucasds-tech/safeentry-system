package com.safeentry.backend.service;

import com.safeentry.backend.model.Residents;
import com.safeentry.backend.repository.ResidentsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ResidentService {

    @Autowired
    private ResidentsRepository residentRepository;

    public Residents salvar(Residents residents) {

        String doc = residents.getDocument();
        
        if (doc == null || doc.isBlank()) {
            throw new IllegalArgumentException("O documento é obrigatório.");
        }
        doc = doc.replaceAll("\\D", "");
        residents.setDocument(doc);

        // Validação de campo vazio
        if (doc.isBlank()) {
            throw new IllegalArgumentException("O documento é obrigatório.");
        }

        // Validação de tamanho
        if (doc.length() != 11 && (doc.length() < 7 || doc.length() > 9)) {

            throw new IllegalArgumentException(
                    "Documento inválido. Deve ser um RG (7-9 dígitos) ou CPF (11 dígitos)."
                );
        }

        // Se tiver 11 dígitos, valida CPF
        if (doc.length() == 11) {
            if (!isCpfValido(doc)) {
                throw new IllegalArgumentException("CPF inválido.");
            }
        }

        // VALIDA DOCUMENTO DUPLICADO
        Optional<Residents> existingResident = residentRepository.findByDocument(doc);

        if (existingResident.isPresent()
                && !existingResident.get().getId().equals(residents.getId())) {

            throw new IllegalArgumentException("Documento já cadastrado.");
        }

        return residentRepository.save(residents);
    }

    // Algoritmo básico de validação de CPF (Dígitos verificadores)
    private boolean isCpfValido(String cpf) {
        // Ignora CPFs com todos os números iguais (ex: 11111111111)
        if (cpf.matches("(\\d)\\1{10}")) return false;

        try {
            // Cálculo do 1º dígito
            int sm = 0, weight = 10;
            for (int i = 0; i < 9; i++) {
                sm += (Character.getNumericValue(cpf.charAt(i)) * weight--);
            }
            int r = 11 - (sm % 11);
            char dig10 = (r == 10 || r == 11) ? '0' : (char) (r + 48);

            // Cálculo do 2º dígito
            sm = 0; weight = 11;
            for (int i = 0; i < 10; i++) {
                sm += (Character.getNumericValue(cpf.charAt(i)) * weight--);
            }
            r = 11 - (sm % 11);
            char dig11 = (r == 10 || r == 11) ? '0' : (char) (r + 48);

            return (dig10 == cpf.charAt(9)) && (dig11 == cpf.charAt(10));
        } catch (Exception e) {
            return false;
        }
    }
}