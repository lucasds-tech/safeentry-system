
package com.safeentry.backend.controller;

import com.safeentry.backend.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {

        String username = body.get("username");
        String password = body.get("password");

        if("sindico".equals(username) && "123456".equals(password)) {
            return ResponseEntity.ok(
                    Map.of("token", JwtUtil.generateToken(username))
            );
        }

        return ResponseEntity.badRequest().body("Invalid credentials");
    }
}
