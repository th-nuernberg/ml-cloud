from data.StorageIO import StorageIO

KEY_TARGET_COLUMN = "target_columns"

KEY_DATA_COLUMN = "data_columns"

KEY_COLUMN_NAME = "column_names"

KEY_TABLE_VIEW = "view"

dummy_ref = {
    "column_names": ["a", "b", "c"],
    "data_columns": [0, 1],
    "target_columns": [3]
}


def get_all_view_configs(storageIO: StorageIO, username: str, reference_view_id: str):
    all_views = storageIO.getAllIds(KEY_TABLE_VIEW, username)

    if not reference_view_id in all_views:
        print("Given view does not exist")
        return []

    all_views.remove(reference_view_id)

    all_view_configs = {}

    config_list = storageIO.getEntries(KEY_TABLE_VIEW, username, all_views)

    for view_id, config in zip(all_views, config_list):
        all_view_configs[view_id] = config

    return all_view_configs


def get_compatible_views(storageIO: StorageIO, username: str, reference_view_id: str):
    compatible_candidates = get_all_view_configs(storageIO, username, reference_view_id)
    reference_view_config = storageIO.getEntry(KEY_TABLE_VIEW, username, reference_view_id)

    if not KEY_COLUMN_NAME in reference_view_config:
        reference_view_config[KEY_COLUMN_NAME] = []
    reference_names = reference_view_config[KEY_COLUMN_NAME]
    reference_data_list = reference_view_config[KEY_DATA_COLUMN]
    reference_target_list = reference_view_config[KEY_TARGET_COLUMN]

    possibly_compatible = []  # IDs match but not the names
    compatible = []  # IDs and names match

    for candidate_id, candidate_config in compatible_candidates.items():
        if not KEY_COLUMN_NAME in candidate_config:
            candidate_config[KEY_COLUMN_NAME] = []
        candidate_names = candidate_config[KEY_COLUMN_NAME]
        candidate_data_list = candidate_config[KEY_DATA_COLUMN]
        candidate_target_list = candidate_config[KEY_TARGET_COLUMN]

        certainty = 0

        if candidate_data_list == reference_data_list:
            certainty += 1

        if candidate_target_list == reference_target_list:
            certainty += 1

        if candidate_names == reference_names:
            certainty +=1

        if certainty == 2:
            possibly_compatible.append(candidate_id)
        elif certainty == 3:
            compatible.append(candidate_id)

    return compatible # We currently only support equal structures

