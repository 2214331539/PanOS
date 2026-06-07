from enum import StrEnum


class AdminRole(StrEnum):
    owner = "owner"
    editor = "editor"


class ContentStatus(StrEnum):
    draft = "draft"
    published = "published"
    archived = "archived"


class Visibility(StrEnum):
    public = "public"
    unlisted = "unlisted"
    private = "private"


class ProjectStatus(StrEnum):
    concept = "concept"
    prototype = "prototype"
    building = "building"
    launched = "launched"
    paused = "paused"
    archived = "archived"


class MediaType(StrEnum):
    image = "image"
    video = "video"
    document = "document"
    audio = "audio"
    other = "other"


class ContactStatus(StrEnum):
    new = "new"
    read = "read"
    replied = "replied"
    archived = "archived"

