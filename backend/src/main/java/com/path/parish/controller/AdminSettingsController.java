package com.path.parish.controller;

import com.path.parish.dto.ApiResponse;
import com.path.parish.model.SiteSetting;
import com.path.parish.repository.SiteSettingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/settings")
@CrossOrigin(origins = "*")
public class AdminSettingsController {

    private final SiteSettingRepository siteSettingRepository;

    public AdminSettingsController(SiteSettingRepository siteSettingRepository) {
        this.siteSettingRepository = siteSettingRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> getAllSettings() {
        List<SiteSetting> list = siteSettingRepository.findAll();
        Map<String, String> map = new HashMap<>();
        for (SiteSetting s : list) {
            map.put(s.getSettingKey(), s.getSettingValue());
        }
        return ResponseEntity.ok(ApiResponse.ok(map));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> saveSettings(@RequestBody Map<String, String> settings) {
        for (Map.Entry<String, String> entry : settings.entrySet()) {
            siteSettingRepository.findBySettingKey(entry.getKey()).ifPresentOrElse(
                    s -> {
                        s.setSettingValue(entry.getValue());
                        siteSettingRepository.save(s);
                    },
                    () -> siteSettingRepository.save(new SiteSetting(entry.getKey(), entry.getValue()))
            );
        }
        return ResponseEntity.ok(ApiResponse.ok("Settings saved successfully", settings));
    }
}
