-- Seed data for testing
-- Note: Passwords are 'password123' hashed with bcrypt

-- Insert test users (travelers and owners)
INSERT INTO users (name, email, password_hash, role, phone, about_me, city, country, languages, gender) VALUES
('John Traveler', 'traveler@test.com', '$2b$10$rKz4YqZ4YqZ4YqZ4YqZ4YuO7aB8dHZXCjTJ0vZ4YqZ4YqZ4YqZ4Yq', 'traveler', '123-456-7890', 'Love to travel and explore new places!', 'New York', 'United States', 'English, Spanish', 'Male'),
('Sarah Owner', 'owner@test.com', '$2b$10$rKz4YqZ4YqZ4YqZ4YqZ4YuO7aB8dHZXCjTJ0vZ4YqZ4YqZ4YqZ4Yq', 'owner', '098-765-4321', 'Property owner with multiple listings.', 'Los Angeles', 'United States', 'English', 'Female'),
('Mike Explorer', 'mike@test.com', '$2b$10$rKz4YqZ4YqZ4YqZ4YqZ4YuO7aB8dHZXCjTJ0vZ4YqZ4YqZ4YqZ4Yq', 'traveler', '555-123-4567', 'Adventure seeker and foodie.', 'Chicago', 'United States', 'English', 'Male'),
('Emma Host', 'emma@test.com', '$2b$10$rKz4YqZ4YqZ4YqZ4YqZ4YuO7aB8dHZXCjTJ0vZ4YqZ4YqZ4YqZ4Yq', 'owner', '555-987-6543', 'Hosting since 2020.', 'Miami', 'United States', 'English, French', 'Female');

-- Insert test properties
INSERT INTO properties (owner_id, property_name, property_type, description, location, city, country, price_per_night, bedrooms, bathrooms, max_guests, amenities, images) VALUES
(2, 'Luxury Beach House', 'House', 'Beautiful beachfront property with stunning ocean views', '123 Ocean Drive', 'Los Angeles', 'United States', 350.00, 3, 2, 6, '["WiFi", "Pool", "Beach Access", "Parking", "Kitchen", "Air Conditioning"]', '["beach-house-1.jpg", "beach-house-2.jpg"]'),
(2, 'Cozy Downtown Apartment', 'Apartment', 'Modern apartment in the heart of the city', '456 Main St', 'Los Angeles', 'United States', 120.00, 1, 1, 2, '["WiFi", "Kitchen", "Elevator", "Gym"]', '["apartment-1.jpg"]'),
(4, 'Mountain Cabin Retreat', 'Cabin', 'Peaceful cabin surrounded by nature', '789 Mountain Road', 'Miami', 'United States', 200.00, 2, 1, 4, '["WiFi", "Fireplace", "Hiking Trails", "Parking"]', '["cabin-1.jpg", "cabin-2.jpg"]'),
(4, 'City Center Studio', 'Studio', 'Compact studio perfect for solo travelers', '321 Downtown Blvd', 'Miami', 'United States', 80.00, 1, 1, 2, '["WiFi", "Kitchen", "Air Conditioning"]', '["studio-1.jpg"]');

-- Insert test bookings
INSERT INTO bookings (property_id, traveler_id, start_date, end_date, num_guests, total_price, status) VALUES
(1, 1, '2025-11-01', '2025-11-05', 4, 1400.00, 'accepted'),
(2, 3, '2025-10-25', '2025-10-27', 2, 240.00, 'pending'),
(3, 1, '2025-12-10', '2025-12-15', 3, 1000.00, 'pending');

-- Add some favorites for travelers
UPDATE users SET favorite_property_ids = JSON_ARRAY(1, 3) WHERE id = 1;
UPDATE users SET favorite_property_ids = JSON_ARRAY(2, 4) WHERE id = 3;

