from django.db import migrations


CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS `api_accesscontrolentry` (
    `id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY,
    `role` varchar(20) NOT NULL,
    `granted_at` datetime(6) NOT NULL,
    `granted_by_id` integer NULL,
    `user_id` integer NOT NULL,
    `presentation_id` bigint NOT NULL,
    UNIQUE KEY `api_accesscontrolentry_presentation_id_user_id_95fa1fb0_uniq` (`presentation_id`, `user_id`),
    KEY `api_accesscontrolentry_granted_by_id_d5e9287e_fk_auth_user_id` (`granted_by_id`),
    KEY `api_accesscontrolentry_user_id_b7a64ee4_fk_auth_user_id` (`user_id`),
    KEY `api_accesscontrolent_presentation_id_6a4ba3d5_fk_api_prese` (`presentation_id`),
    CONSTRAINT `api_accesscontrolentry_granted_by_id_d5e9287e_fk_auth_user_id`
        FOREIGN KEY (`granted_by_id`) REFERENCES `auth_user` (`id`),
    CONSTRAINT `api_accesscontrolentry_user_id_b7a64ee4_fk_auth_user_id`
        FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
    CONSTRAINT `api_accesscontrolent_presentation_id_6a4ba3d5_fk_api_prese`
        FOREIGN KEY (`presentation_id`) REFERENCES `api_presentation` (`id`)
) ENGINE=InnoDB;
"""

DROP_TABLE_SQL = "DROP TABLE IF EXISTS `api_accesscontrolentry`;"


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql=CREATE_TABLE_SQL,
            reverse_sql=DROP_TABLE_SQL,
        ),
    ]
