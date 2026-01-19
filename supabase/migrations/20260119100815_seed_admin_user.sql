/*
  # Seed Default Admin User

  ## Overview
  Creates the default admin user with credentials: admin/admin
  This is safe to run multiple times - it will only insert if the user doesn't exist.

  ## Details
  - Username: admin
  - Password: admin
  - Role: admin
  - Email: admin@netopstudio.local

  ## Important Notes
  - Uses Supabase auth.users table for authentication
  - Automatically creates corresponding profile via trigger
  - Password is hashed securely by Supabase
*/

DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Check if admin user already exists
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@netopstudio.local';

  -- Only create if doesn't exist
  IF admin_user_id IS NULL THEN
    -- Insert admin user into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@netopstudio.local',
      crypt('admin', gen_salt('bf')),
      now(),
      jsonb_build_object('username', 'admin', 'role', 'admin'),
      now(),
      now(),
      '',
      ''
    ) RETURNING id INTO admin_user_id;

    -- The trigger will automatically create the profile with admin role
    RAISE NOTICE 'Admin user created successfully with ID: %', admin_user_id;
  ELSE
    RAISE NOTICE 'Admin user already exists with ID: %', admin_user_id;
  END IF;
END $$;
