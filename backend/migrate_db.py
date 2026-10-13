import sqlite3

def migrate():
    conn = sqlite3.connect('backend/homeease.db')
    c = conn.cursor()
    cols = [col[1] for col in c.execute('PRAGMA table_info(services);').fetchall()]
    if 'slug' not in cols:
        c.execute('ALTER TABLE services ADD COLUMN slug VARCHAR(150);')
        print('Added slug')
    if 'short_description' not in cols:
        c.execute('ALTER TABLE services ADD COLUMN short_description VARCHAR(255);')
        print('Added short_description')
    if 'image_url' not in cols:
        c.execute('ALTER TABLE services ADD COLUMN image_url VARCHAR(500);')
        print('Added image_url')
    if 'included_items' not in cols:
        c.execute('ALTER TABLE services ADD COLUMN included_items TEXT;')
        print('Added included_items')

    # Remove demo sample bookings and demo customer contacts
    c.execute("DELETE FROM bookings WHERE booking_code IN ('JND-2026-1001', 'JND-2026-1002', 'JND-2026-1003');")
    c.execute("DELETE FROM customer_contacts WHERE phone IN ('9825012345', '9724067890', '9909011223');")
    conn.commit()
    print('Remaining bookings in DB:', c.execute('SELECT count(*) FROM bookings').fetchone()[0])
    print('Remaining customers in DB:', c.execute('SELECT count(*) FROM customer_contacts').fetchone()[0])
    conn.close()

if __name__ == '__main__':
    migrate()
