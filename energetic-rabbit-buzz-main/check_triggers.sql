-- Check for any triggers on order_items table
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgfoid::regproc as function_name
FROM pg_trigger
WHERE tgrelid = 'order_items'::regclass;

-- Check for any rules on order_items table
SELECT 
  rulename as rule_name,
  ev_class::regclass as table_name
FROM pg_rewrite
WHERE ev_class = 'order_items'::regclass;

-- Check for any event triggers
SELECT 
  evtname as event_trigger_name,
  evtevent as event_type
FROM pg_event_trigger;