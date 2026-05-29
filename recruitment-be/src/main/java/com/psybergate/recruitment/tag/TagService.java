package com.psybergate.recruitment.tag;

import com.psybergate.recruitment.domain.Tag;

import java.util.List;
import java.util.Set;

public interface TagService {

    Tag findOrCreate(String name);

    Set<Tag> resolveTagNames(List<String> names);

    List<String> listInUse();

    void cleanupOrphans();
}
