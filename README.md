Các bước init

 - Tạo DB "crmgozic"

cmd: 
python -m venv venv
.\venv\Scripts\activate
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000

tạo thêm 1 terminal nữa để chạy angular
cd frontend
npm install
npm start