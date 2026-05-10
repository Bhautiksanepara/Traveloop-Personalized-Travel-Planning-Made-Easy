ALTER TABLE stop_activities
  ADD COLUMN scheduled_date DATE NULL AFTER activity_id;

CREATE INDEX idx_stop_act_date
  ON stop_activities (stop_id, scheduled_date);
