package com.psybergate.recruitment.tag;

import com.psybergate.recruitment.domain.Tag;
import com.psybergate.recruitment.tag.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {

    private final TagRepository tagRepository;

    @Override
    public Tag findOrCreate(String name) {
        String normalized = name.trim().toLowerCase();
        return tagRepository.findByNameIgnoreCase(normalized).orElseGet(() -> {
            Tag tag = new Tag();
            tag.setName(normalized);
            return tagRepository.save(tag);
        });
    }

    @Override
    public Set<Tag> resolveTagNames(List<String> names) {
        if (names == null || names.isEmpty()) return new HashSet<>();
        return names.stream().map(this::findOrCreate).collect(Collectors.toSet());
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> listInUse() {
        return tagRepository.findAllInUse().stream().map(Tag::getName).toList();
    }

    @Override
    public void cleanupOrphans() {
        tagRepository.deleteAll(tagRepository.findOrphans());
    }
}
