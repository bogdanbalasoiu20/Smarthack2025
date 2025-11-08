"""
Script rapid de test pentru API-ul de prezentări
Rulează după ce pornești backend-ul
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_hello():
    """Test basic connectivity"""
    print("1. Testing basic connectivity...")
    try:
        response = requests.get(f"{BASE_URL}/hello/")
        print(f"   ✓ Status: {response.status_code}")
        print(f"   ✓ Response: {response.json()}")
        return True
    except Exception as e:
        print(f"   ✗ Error: {e}")
        print("   → Backend nu rulează! Rulează: python manage.py runserver")
        return False

def test_login():
    """Test login (trebuie să ai un user creat)"""
    print("\n2. Testing login...")
    username = input("   Username: ").strip()
    password = input("   Password: ").strip()

    try:
        response = requests.post(
            f"{BASE_URL}/login/",
            json={"username": username, "password": password}
        )

        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ Login successful!")
            print(f"   ✓ Token: {data['token'][:20]}...")
            print(f"   ✓ User: {data['user']['username']}")
            return data['token']
        else:
            print(f"   ✗ Login failed: {response.json()}")
            return None
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return None

def test_presentations(token):
    """Test presentations API"""
    print("\n3. Testing presentations API...")

    try:
        # Lista prezentări
        response = requests.get(
            f"{BASE_URL}/presentations/presentations/",
            headers={"Authorization": f"Token {token}"}
        )
        print(f"   ✓ Get presentations: {response.status_code}")
        presentations = response.json()
        print(f"   ✓ Found {len(presentations)} presentations")

        # Creează o prezentare de test
        response = requests.post(
            f"{BASE_URL}/presentations/presentations/",
            headers={
                "Authorization": f"Token {token}",
                "Content-Type": "application/json"
            },
            json={
                "title": "Test Presentation",
                "description": "Created by test script"
            }
        )

        if response.status_code == 201:
            presentation = response.json()
            print(f"   ✓ Created presentation ID: {presentation['id']}")

            # Creează un frame
            response = requests.post(
                f"{BASE_URL}/presentations/frames/",
                headers={
                    "Authorization": f"Token {token}",
                    "Content-Type": "application/json"
                },
                json={
                    "presentation": presentation['id'],
                    "title": "First Frame",
                    "position": json.dumps({
                        "x": 0, "y": 0,
                        "width": 1920, "height": 1080,
                        "rotation": 0
                    }),
                    "background_color": "#ffffff"
                }
            )

            if response.status_code == 201:
                frame = response.json()
                print(f"   ✓ Created frame ID: {frame['id']}")

                # Creează un element text
                response = requests.post(
                    f"{BASE_URL}/presentations/elements/",
                    headers={
                        "Authorization": f"Token {token}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "frame": frame['id'],
                        "element_type": "TEXT",
                        "position": json.dumps({
                            "x": 100, "y": 100,
                            "width": 400, "height": 100,
                            "rotation": 0, "z_index": 1
                        }),
                        "content": json.dumps({
                            "text": "Hello from test!",
                            "fontSize": 32,
                            "fontFamily": "Inter",
                            "color": "#000000"
                        })
                    }
                )

                if response.status_code == 201:
                    element = response.json()
                    print(f"   ✓ Created text element ID: {element['id']}")
                    print(f"\n   ✓✓✓ SUCCESS! Presentation ready at:")
                    print(f"       http://localhost:3000/presentations/{presentation['id']}")
                    return True

        print(f"   ✗ Failed somewhere: {response.status_code}")
        return False

    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False

def main():
    print("=" * 60)
    print("TEST API PREZENTĂRI")
    print("=" * 60)

    # Test 1: Connectivity
    if not test_hello():
        print("\n❌ Backend nu rulează. Pornește-l mai întâi:")
        print("   python manage.py runserver")
        print("   SAU")
        print("   daphne -b 0.0.0.0 -p 8000 smarthack2025.asgi:application")
        return

    # Test 2: Login
    token = test_login()
    if not token:
        print("\n❌ Nu te-ai putut autentifica.")
        print("   Creează un user: python manage.py createsuperuser")
        return

    # Test 3: Prezentări
    if test_presentations(token):
        print("\n" + "=" * 60)
        print("✅ TOATE TESTELE AU TRECUT!")
        print("=" * 60)
        print("\nPoți accesa aplicația la:")
        print("   http://localhost:3000/presentations")
    else:
        print("\n❌ Testul prezentărilor a eșuat")
        print("   Verifică că ai rulat migrările:")
        print("   python manage.py makemigrations api")
        print("   python manage.py migrate")

if __name__ == "__main__":
    main()
