package com.dfrm.service;

import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.dfrm.model.Admin;
import com.dfrm.repository.AdminRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public Admin createAdmin(Admin admin) {
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        return adminRepository.save(admin);
    }

    public Optional<Admin> findByEmail(String email) {
        return adminRepository.findByEmail(email);
    }

    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    public Optional<Admin> getAdminById(String id) {
        return adminRepository.findById(id);
    }

    public void deleteAdmin(String id) {
        adminRepository.deleteById(id);
    }

    public Admin updateAdmin(Admin admin) {
        if (admin.getPassword() != null && !admin.getPassword().startsWith("$2a$")) {
            admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        }
        return adminRepository.save(admin);
    }

    public boolean existsByEmail(String email) {
        return adminRepository.existsByEmail(email);
    }
} 