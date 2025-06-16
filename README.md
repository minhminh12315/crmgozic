# ⚙️ Cài đặt nhanh

### 1. Clone project

```bash
git clone https://github.com/minhminh12315/crmgozic.git
cd crmgozic
```
## Backend

### 2. Tạo virtual environment và cài dependencies

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
cd backend
pip install -r requirements.txt
```

### 3. Tạo Database

- Tạo database 'crmgozic' bằng mysql như sau:
```
# Database
DB_NAME=crmgozic
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
```

### 4. Migrate
```
python manage.py makemigrations
python manage.py migrate
```

### 5. Chạy server và websocket (trong backend)

```
daphne backend.asgi:application
```

### 6. Chạy frontend
- cd frontend
- Bắt buộc phải chạy host 127.0.0.1 để kết nối với websocket
```
npm install
npm start
ng serve --host 127.0.0.1 --port 4200
```

### 7. tạo tài khoản
py manage.py createsuperuser