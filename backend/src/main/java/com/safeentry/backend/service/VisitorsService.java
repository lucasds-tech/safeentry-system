package com.safeentry.backend.service;

import com.safeentry.backend.model.Visitors;
import com.safeentry.backend.repository.VisitorsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class VisitorsService {

    @Autowired
    private VisitorsRepository visitorsRepository;

    public Visitors salvar(Visitors visitors) {

        String doc = visitors.getDocument();
        
        if (doc == null || doc.isBlank()) {
            throw new IllegalArgumentException("O documento é obrigatório.");
        }
        doc = doc.replaceAll("\\D", "");
        visitors.setDocument(doc);

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

        // Algoritmo básico de validação de CPF (Dígitos verificadores)
        Optional<Visitors> existingVisitor = visitorsRepository.findByDocument(doc);

        if (existingVisitor.isPresent()
                && !existingVisitor.get().getId().equals(visitors.getId())) {

            throw new IllegalArgumentException("Documento já cadastrado.");
        }

        return visitorsRepository.save(visitors);
    }

    // Algoritmo básico de validação de CPF
    private boolean isCpfValido(String cpf) {

        // Ignora CPFs com todos os números iguais
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
            sm = 0;
            weight = 11;
            for (int i = 0; i < 10; i++) {
                sm += (Character.getNumericValue(cpf.charAt(i)) * weight--);
            }
            r = 11 - (sm % 11);
            char dig11 = (r == 10 || r == 11) ? '0' : (char) (r + 48);

            return (dig10 == cpf.charAt(9))
                    && (dig11 == cpf.charAt(10));
        } catch (Exception e) {
            return false;
        }
    }
}