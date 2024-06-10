from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify, make_response, send_file
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError
import os, io
from werkzeug.utils import secure_filename
import csv
from sqlalchemy import desc, asc
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
import secrets
from flask_mail import Mail
from flask_mail import Message
from flask_login import LoginManager, UserMixin, user_logged_out
from flask_login import login_user, current_user, logout_user, login_required
import random
import base64
import json

app = Flask(__name__)
login_manager = LoginManager(app)
login_manager.login_view = 'login' #specify the login route
# Set custom messages
login_manager.login_message = "Unauthorized Access! Please log in!"
login_manager.login_message_category = "danger"

# Database configuration
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///library.db"
db = SQLAlchemy(app)

# Create the database tables
with app.app_context():
    db.create_all()

# Book model for the library inventory
class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    meals = db.relationship('Meal', backref='category', lazy=True)

class Meal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True)
    price = db.Column(db.Float)
    qty = db.Column(db.Integer)
    image_data = db.Column(db.LargeBinary)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=True)  # Add this line
    tags = db.relationship('Tag', secondary='meal_tag_assoc', backref=db.backref('meals', lazy='dynamic'))

class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    name = db.Column(db.String(50), nullable=False)
    type = db.Column(db.Integer, nullable=False)

    # Define relationship with options
    options = db.relationship('Option', backref='tag', lazy='dynamic')

class Option(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    name = db.Column(db.String(50), nullable=False)
    is_default = db.Column(db.Boolean, nullable=False)
    price = db.Column(db.Integer, nullable=False)
    tag_id = db.Column(db.Integer, db.ForeignKey('tag.id'), nullable=False)

# Association table between Meal and Tag
meal_tag_assoc = db.Table('meal_tag_assoc',
    db.Column('meal_id', db.Integer, db.ForeignKey('meal.id'), nullable=False),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), nullable=False)
)

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.now())
    status = db.Column(db.Integer, nullable=False, default=0)
    json = db.Column(db.JSON, nullable=False)
    price = db.Column(db.Integer, nullable=False)
    employee_id = db.Column(db.Integer, nullable=True)
    
class User(db.Model,UserMixin):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    first_name = db.Column(db.String(255), unique=False, nullable=False)
    last_name = db.Column(db.String(255), unique=False, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    school_id = db.Column(db.String(255), nullable=False)
    balance = db.Column(db.Float, nullable=False)
    type = db.Column(db.Integer, nullable=False)
    lunch_period = db.Column(db.Integer, nullable=False)
    orders = db.relationship('Order',backref='user',lazy=True)

# Create the database tables
with app.app_context():
    db.create_all()

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Route for the main page
@app.route("/", methods=["POST", "GET"])
@login_required
def menu():
    if current_user.type == 3:
        
        if request.method == "POST":
            order_id = int(request.form.get('order_id'))
            command = int(request.form.get("command"))
            order = Order.query.filter_by(id=order_id).first()
            if command == 0:
                if order.employee_id != current_user.id:
                    if order.employee_id == None:
                        order.employee_id = current_user.id
                    else:
                        flash("Order Already Claimed", "danger")
            if command == 1:
                order.status = 1
                order.employee_id = None
                json = order.json
                for meal_json in json:
                    meal = Meal.query.filter_by(id=meal_json[0]).first()
                    if meal.qty:
                        meal.qty = int(meal.qty) - 1
            if command == 2:
                order.employee_id = None
            if command == 3:
                order.employee_id = None
                order.status = 2

            db.session.commit()
            

        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        tmr_start = (datetime.now() + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        all_orders = Order.query.filter(Order.timestamp >= today_start, Order.timestamp < tmr_start)
        orders = Order.query.filter_by(employee_id=None).filter(Order.timestamp >= today_start, Order.timestamp < tmr_start).filter_by(status=0)
        workbench = Order.query.filter_by(employee_id=current_user.id).filter(Order.timestamp >= today_start, Order.timestamp < tmr_start).filter_by(status=0)

        meals = Meal.query.all()
        mealsData = {i.id: [i.name, i.price, get_meal_tag_json(i.id)] for i in meals}
        orderData = {str(order.id) : order.json for order in all_orders}

        return render_template("employee.html", orders=orders, workbench=workbench, mealsData=mealsData, orderData=orderData)
    
    elif current_user.type == 2:

        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        tmr_start = (datetime.now() + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        all_orders = Order.query.filter(Order.timestamp >= today_start, Order.timestamp < tmr_start)
        orders = Order.query.filter(Order.timestamp >= today_start, Order.timestamp < tmr_start).filter(Order.employee_id != None)

        meals = Meal.query.all()
        mealsData = {i.id: [i.name, i.price, get_meal_tag_json(i.id)] for i in meals}
        orderData = {str(order.id) : order.json for order in all_orders}

        return render_template("employee.html", orders=orders, mealsData=mealsData, orderData=orderData)

    else:
        
        all_meals = Meal.query.order_by(asc(Meal.id))
        categories = Category.query.all()
        add_to_cart = request.args.get('add_to_cart')
        
        mealsData = {i.id: [i.name, i.price, get_meal_tag_json(i.id)] for i in all_meals}

        meals = Meal.query.filter(Meal.qty != 0).order_by(asc(Meal.id))
        
        image_data_b64 = {}
        for meal in meals:
            image_data_b64[meal.id] = base64.b64encode(meal.image_data).decode('utf-8')

        return render_template(
            "menu.html",
            meals=meals,
            categories=categories,
            mealsData=mealsData,
            add_to_cart=add_to_cart,
            image_data_b64=image_data_b64
        )

@app.route("/addcategory", methods=["POST", "GET"])
@login_required
def addcategory():
    if current_user.type == 1:
        if request.method == "POST":
            name = request.form.get("name")

            if not name:
                flash("Please enter a category name.", "danger")
                return render_template("addcategory.html")

            category = Category.query.filter_by(name=name).first()
            if category is not None:
                flash("Category already exists! Try a different name", "danger")
                return render_template("addcategory.html")

            new_category = Category(name=name)
            db.session.add(new_category)
            db.session.commit()
            flash("Category created successfully!", "success")
            return redirect(url_for('menu'))
        return render_template("addcategory.html")
    else:
        flash("Unauthorized access.", "danger")
        return redirect(url_for("menu"))

# @app.route('/my_orders', methods=['GET'])
# @login_required
# def my_orders():
#     orders = Order.query.filter_by(user_id=current_user.id, ordered=True).all()
#     meals = {order.meal_id: Meal.query.get(order.meal_id) for order in orders}
#     return render_template('my_orders.html', orders=orders, meals=meals)

# @app.route('/manage_orders', methods=['GET'])
# @login_required
# def manage_orders():
#     if not current_user.employee:
#         flash("Unauthorized access.", "danger")
#         return redirect(url_for("menu"))

#     orders = Order.query.filter_by(ordered=True).all()
#     users = {order.user_id: User.query.get(order.user_id) for order in orders}
#     meals = {order.meal_id: Meal.query.get(order.meal_id) for order in orders}
#     return render_template('manage_orders.html', orders=orders, users=users, meals=meals)

# @app.route('/update_order_status', methods=['POST'])
# @login_required
# def update_order_status():
#     if not current_user.employee:
#         flash("Unauthorized access.", "danger")
#         return redirect(url_for("menu"))

#     order_id = request.form.get("order_id")
#     status = request.form.get("status")
#     order = Order.query.get(order_id)

#     if order:
#         order.status = status
#         db.session.commit()
#         flash("Order status updated successfully!", "success")
#     else:
#         flash("Order not found.", "danger")

#     return redirect(url_for("manage_orders"))

# @app.route('/delete_order', methods=['POST'])
# @login_required
# def delete_order():
#     order_id = request.form.get("order_id")
#     order = Order.query.get(order_id)
#     if order and (order.user_id == current_user.id or current_user.employee):
#         db.session.delete(order)
#         db.session.commit()
#         flash("Order deleted successfully", "success")
#     else:
#         flash("Unauthorized action or order not found", "danger")

#     if current_user.employee:
#         return redirect(url_for("manage_orders"))
#     else:
#         return redirect(url_for("my_orders"))

@app.route("/addmeal", methods=["POST", "GET"])
@login_required
def addmeal():
    if current_user.type == 1:
        categories = Category.query.all()  # Fetch all categories
        if request.method == "POST":
            name = request.form.get("name")
            price = request.form.get("price").replace("$","",1)
            qty = request.form.get("qty")
            image_file = request.files.get("image_file")
            if "category-select" in request.form: 
                category_id = request.form["category-select"]
            else:
                category_id = 0

            if not (name and price.replace(".","",1).isnumeric() and image_file):
                flash("Please fill in all fields.", "danger")
                return render_template("addmeal.html", categories=categories)

            meal = Meal.query.filter_by(name=name).first()
            if meal is not None:
                flash("Meal already exists! Try a different name", "danger")
                return render_template("addmeal.html", categories=categories)

            image_data = image_file.read()

            new_meal = Meal(
                name=name,
                price=round(float(price),2),
                qty=qty,
                image_data=image_data,
                category_id=category_id  # Assign the selected category
            )
            db.session.add(new_meal)

            num_of_tags = int(request.form.get("num_of_tags"))

            for tag_index in range(1, num_of_tags + 1):
                tag_name = request.form.get(f"tag{tag_index}")
                if not tag_name:
                    continue
                tag_type = int(request.form.get(f"tag{tag_index}-type"))

                tag = Tag(name=tag_name, type=tag_type)
                db.session.add(tag)

                new_meal.tags.append(tag)

                if tag_type == 2:
                    option_price = request.form.get(f"tag{tag_index}-price")
                    literal = request.form.get(f"tag{tag_index}-literal")
                    option = Option(name=literal, tag=tag, is_default=bool(request.form.get(f"tag{tag_index}-checkbox")), price=option_price)
                    db.session.add(option)
                else:
                    num_of_options = int(request.form.get(f"tag{tag_index}-num_of_options"))
                    if tag_type == 0:
                        if f"tag{tag_index}-radio" in request.form:
                            default_index = int(request.form[f"tag{tag_index}-radio"])
                        else:
                            db.session.rollback()
                            flash("Please fill in all single-option tags.", "danger")
                            return redirect(url_for('addmeal'))

                    for option_index in range(1, num_of_options + 1):
                        option_name = request.form.get(f"tag{tag_index}-option{option_index}")
                        option_price = request.form.get(f"tag{tag_index}-option{option_index}-price")
                        if not option_name:
                            continue
                        if tag_type == 1:
                            option = Option(
                                name=option_name, 
                                tag=tag, 
                                is_default=bool(request.form.get(f"tag{tag_index}-checkbox{option_index}")),
                                price=option_price
                            )
                        else:
                            option = Option(name=option_name, tag=tag, is_default=(option_index == default_index), price=option_price)
                        db.session.add(option)
                        
            db.session.commit()

            flash("Meal created successfully!", "success")
            return redirect(url_for('menu'))
        return render_template("addmeal.html", categories=categories)
    else:
        flash("Unauthorized access.", "danger")
        return redirect(url_for("menu"))
    
@app.route('/cart_count', methods=['GET'])
@login_required
def cart_count():
    cart_count = Order.query.filter_by(user_id=current_user.id).count()
    return jsonify({'cart_count': cart_count})

@app.route("/editmeal", methods=["POST", "GET"])
@login_required
def editmeal():
    if current_user.type == 1:
        categories = Category.query.all()  # Fetch all categories

        if request.method == "POST":
            meal_id = int(request.form.get("meal_id"))
            meal = Meal.query.filter_by(id=meal_id).first()
            mealData = [meal.name, meal.price, get_meal_tag_json(meal_id)]
            image_data = meal.image_data

            for tag in meal.tags:
                for option in tag.options:
                    db.session.delete(option)
                db.session.delete(tag)
            
            db.session.delete(meal)

            name = request.form.get("name")
            price = request.form.get("price").replace("$","",1)
            qty = request.form.get("qty")
            if "image_file" in request.files:
                image_file = request.files.get("image_file")
            if "category-select" in request.form: 
                category_id = request.form["category-select"]
            else:
                category_id = 0

            if not (name and price.replace(".","",1).isnumeric()):
                flash("Please fill in all fields.", "danger")
                return render_template("addmeal.html", categories=categories, mealData=mealData, input_meal=meal)

            meal = Meal.query.filter_by(name=name).first()
            if meal is not None:
                flash("Meal already exists! Try a different name", "danger")
                return render_template("addmeal.html", categories=categories, mealData=mealData, input_meal=meal)

            if image_file:
                image_data = image_file.read()

            new_meal = Meal(
                id=meal_id,
                name=name,
                price=round(float(price),2),
                qty=qty,
                image_data=image_data,
                category_id=category_id  # Assign the selected category
            )
            db.session.add(new_meal)

            num_of_tags = int(request.form.get("num_of_tags"))

            for tag_index in range(1, num_of_tags + 1):
                tag_name = request.form.get(f"tag{tag_index}")
                if not tag_name:
                    continue
                tag_type = int(request.form.get(f"tag{tag_index}-type"))

                tag = Tag(name=tag_name, type=tag_type)
                db.session.add(tag)

                new_meal.tags.append(tag)

                if tag_type == 2:
                    option_price = request.form.get(f"tag{tag_index}-price")
                    literal = request.form.get(f"tag{tag_index}-literal")
                    option = Option(name=literal, tag=tag, is_default=bool(request.form.get(f"tag{tag_index}-checkbox")), price=option_price)
                    db.session.add(option)
                else:
                    num_of_options = int(request.form.get(f"tag{tag_index}-num_of_options"))
                    if tag_type == 0:
                        if f"tag{tag_index}-radio" in request.form:
                            default_index = int(request.form[f"tag{tag_index}-radio"])
                        else:
                            db.session.rollback()
                            flash("Please fill in all single-option tags.", "danger")
                            return render_template("addmeal.html", categories=categories, mealData=mealData, input_meal=meal)

                    for option_index in range(1, num_of_options + 1):
                        option_name = request.form.get(f"tag{tag_index}-option{option_index}")
                        option_price = request.form.get(f"tag{tag_index}-option{option_index}-price")
                        if not option_name:
                            continue
                        if tag_type == 1:
                            option = Option(
                                name=option_name, 
                                tag=tag, 
                                is_default=bool(request.form.get(f"tag{tag_index}-checkbox{option_index}")),
                                price=option_price
                            )
                        else:
                            option = Option(name=option_name, tag=tag, is_default=(option_index == default_index), price=option_price)
                        db.session.add(option)

            db.session.commit()

            flash("Meal edited successfully!", "success")
            return redirect(url_for('menu'))
        meal_id = int(request.args.get("meal_id"))
        meal = Meal.query.filter_by(id=meal_id).first()
        mealData = [meal.name, meal.price, get_meal_tag_json(meal_id)]
        return render_template("addmeal.html", categories=categories, mealData=mealData, input_meal=meal)
    else:
        flash("Unauthorized access.", "danger")
        return redirect(url_for("menu"))


@app.route("/delmeal")
def delmeal():
    if current_user.type == 1:
        meal_id = request.args.get("meal_id")
        meal = Meal.query.get(meal_id)

        if meal:
            for tag in meal.tags:
                for option in tag.options:
                    db.session.delete(option)
                db.session.delete(tag)
            
            db.session.delete(meal)
            db.session.commit()
            flash("Meal and its associated tags and options deleted successfully!", "success")
        else:
            flash("Meal not found.", "danger")
    else:
        flash("Unauthorized access.", "danger")

    return redirect(url_for("menu"))

@app.route("/checkout", methods=["POST", "GET"])
@login_required
def checkout():
    
    meals = Meal.query.order_by(asc(Meal.id))
    mealsData = {i.id: [i.name, i.price, get_meal_tag_json(i.id)] for i in meals}
    
    return render_template("checkout.html", mealsData=mealsData)

def get_price(meal_tags, item_tags):
    price = 0.0
    for meal in item_tags:
        tag_price = 0.0
        for key, value in meal[2].items():
            if meal_tags[meal[0]][2] != {}:
                for tag in meal_tags[meal[0]][2]:
                    if tag['id'] == key:
                        iter_check = False
                        if tag['type'] == 0:
                            for option in tag['options']:
                                iter_check = True
                                if option['id'] == value:
                                    tag_price = option['price']
                                    iter_check = False
                                    break
                            if iter_check:
                                return -1
                        elif tag['type'] == 1:
                            for id_ in value:
                                iter_check = True
                                for option in tag['options']:
                                    if option['id'] == id_:
                                        tag_price = option['price']
                                        iter_check = False
                                        break
                                if iter_check:
                                    return -1
                        elif tag['type'] == 2:
                            if value:
                                if 'name' in tag['options'][0]:
                                    tag_price = tag['options'][0]['price']
                                else:
                                    return -1
                        if iter_check:
                            return -1
                        break
        price += (meal_tags[meal[0]][1] + tag_price) * meal[1]

    return price

@app.route("/sendorder", methods=["POST", "GET"])
@login_required
def sendorder():
    data = request.get_json()['value']
    meals = Meal.query.order_by(asc(Meal.id))
    mealsData = {i.id: [i.name, i.price, get_meal_tag_json(i.id)] for i in meals}
    price = get_price(mealsData, data)

    order = Order(user_id=current_user.id, json=data, price=price)
    db.session.add(order)
    db.session.commit()
    return jsonify({'redirect': url_for('menu')})

# @app.route('/cart', methods=['GET'])
# @login_required
# def cart():
#     cart_items = CartItem.query.filter_by(user_id=current_user.id).all()
#     meals = {item.meal_id: Meal.query.get(item.meal_id) for item in cart_items}
#     return render_template('cart.html', cart_items=cart_items, meals=meals)

# @app.route('/update_cart', methods=['POST'])
# @login_required
# def update_cart():
#     data = request.get_json()
#     cart_items = data['cartItems']

#     # Clear existing cart items for the user
#     CartItem.query.filter_by(user_id=current_user.id).delete()

#     # Add new cart items to the database
#     for item in cart_items:
#         meal_id = item[0]
#         cart_item = CartItem(user_id=current_user.id, meal_id=meal_id, quantity=1)
#         db.session.add(cart_item)

#     db.session.commit()

#     return jsonify({'message': 'Cart updated successfully'})

# @app.route('/delcartitem', methods=['POST'])
# @login_required
# def delcartitem():
#     item_id = request.form.get("item_id")
#     cart_item = CartItem.query.get(item_id)
#     if cart_item and cart_item.user_id == current_user.id:
#         db.session.delete(cart_item)
#         db.session.commit()
#         flash("Item removed from cart", "success")
#     else:
#         flash("Unauthorized action or item not found", "danger")

#     return redirect(url_for("cart"))

# Route for the main page
@app.route("/login", methods=["POST", "GET"])
def login():

    # -- funny admin code, no touchy
    admin = User.query.filter_by(type=1).first()
    employee = User.query.filter_by(type=2).first()
    order_manager = User.query.filter_by(type=3).first()
    if admin is None:
        new_admin = User(
            first_name="Quandale",
            last_name="Dingle",
            email="rbclews@gmail.com",
            school_id="admin",
            balance=0,
            type=1,
            lunch_period=0
        )
        db.session.add(new_admin)
    if employee is None:
        new_employee1 = User(
            first_name="Dwayne",
            last_name="Johnson",
            email="aidenhwang07@gmail.com",
            school_id="employee",
            balance=0,
            type=2,
            lunch_period=0
        )
        new_employee2 = User(
            first_name="John",
            last_name="Cena",
            email="someone@gmail.com",
            school_id="employee",
            balance=0,
            type=2,
            lunch_period=0
        )
        new_employee3 = User(
            first_name="H",
            last_name="E",
            email="funny@gmail.com",
            school_id="employee",
            balance=0,
            type=2,
            lunch_period=0
        )
        db.session.add(new_employee1)
        db.session.add(new_employee2)
        db.session.add(new_employee3)
    if order_manager is None:
        new_order_manager = User(
            first_name="Karen",
            last_name="K",
            email="karen@gmail.com",
            school_id="employee",
            balance=0,
            type=3,
            lunch_period=0
        )
        db.session.add(new_order_manager)
    db.session.commit()
    # --

    if request.method == "POST":
        school_id = request.form.get("school_id")
        email = request.form.get("email")
        user = User.query.filter_by(email=email).first()
        
        if user and school_id == user.school_id:
            login_user(user)
            response = make_response(redirect(url_for('menu')))
            return response
        else:
            flash("Invalid credentials!","danger")
    
    return render_template("login.html")

@app.route("/delcategory")
@login_required
def delcategory():
    if current_user.type == 1:
        category_id = request.args.get("category_id")
        if not category_id:
            flash("Category ID is required.", "danger")
            return redirect(url_for("menu"))

        category = Category.query.get(category_id)

        meals = Meal.query.filter_by(category_id=category_id).all()
        for meal in meals:
            meal.category_id = None

        db.session.delete(category)
        db.session.commit()
        flash("Category deleted successfully!", "success")
    else:
        flash("Unauthorized access.", "danger")

    return redirect(url_for("menu"))

@app.route("/logout")
@login_required
def logout():
    logout_user()
    response = make_response(redirect(url_for('login')))
    flash("Logged out successfully", "success")
    return response

@app.route("/signup", methods=["POST", "GET"])
def signup():
    if request.method == "POST":
        # Get form data
        first_name = request.form.get("first_name")
        last_name = request.form.get("last_name")
        email = request.form.get("email")
        school_id = request.form.get("school_id")
        confirm_school_id = request.form.get("confirm_school_id")
        lunch_period = request.form.get("lunch_period")

        # Validate form data (add your own validation logic)
        if not (
            first_name
            and last_name
            and email
            and school_id
            and confirm_school_id
            and lunch_period
        ):
        # Handle invalid input
            flash("Please fill in all fields.", "danger")
            return render_template("signup.html")
        #handle if existing user
        user = User.query.filter_by(email=email).first()
        if len(school_id) != 6:
            flash("User school ID must be 6 values long", "danger")
            return render_template("signup.html")
        if user is not None and email == user.email:
            # Handle school_id mismatch
            flash("User already exist! Try a different email", "danger")
            return render_template("signup.html")
        if school_id != confirm_school_id:
            # Handle school_id mismatch
            flash("Passwords do not match.", "danger")
            return render_template("signup.html")

        # Get image data
        # image_data = image_file.read()

        # Create a new user instance
        new_user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            school_id=school_id,
            balance=0,
            type=1,
            lunch_period=lunch_period
        )

        # Save the new user to the database
        db.session.add(new_user)
        db.session.commit()

        user = User.query.filter_by(email=email).first()
        login_user(user)

        flash("Account created successfully!", "success")
        return redirect(url_for('menu'))
    return render_template("signup.html")

# Route for the main page

DEFAULT_ACCOUNTS_PER_PAGE = 10

def get_page_range(current_page, total_pages, max_page_buttons=5):
    if total_pages <= max_page_buttons:
        return range(1, total_pages + 1)

    half_buttons = max_page_buttons // 2
    if current_page <= half_buttons:
        return range(1, max_page_buttons + 1)

    if current_page >= total_pages - half_buttons:
        return range(total_pages - max_page_buttons + 1, total_pages + 1)

    return range(current_page - half_buttons, current_page + half_buttons + 1)

@app.route("/accounts")
@login_required
def accounts():
    if current_user.type == 1:
        page = request.args.get("page", 1, type=int)
        users_per_page = request.args.get(
            "users_per_page", DEFAULT_ACCOUNTS_PER_PAGE, type=int
        )
        search_query = request.args.get('search')
        type_filter = request.args.get('type_filter')
        if not type_filter:
            type_filter = 0
        
        type_filter = int(type_filter)
        
        if search_query:
            if type_filter == 0:
                users = User.query.filter(User.last_name.ilike(f'%{search_query}%')).filter_by(type=0).order_by(asc(User.last_name))
            if type_filter == 1:
                users = User.query.filter(User.last_name.ilike(f'%{search_query}%')).filter(User.type>1).order_by(asc(User.last_name))
        else:
            if type_filter == 0:
                users = User.query.filter_by(type=0).order_by(asc(User.last_name))
            if type_filter == 1:
                users = User.query.filter(User.type>1).order_by(asc(User.last_name))
        
        # Apply pagination to the query
        users = users.paginate(page=page, per_page=users_per_page, error_out=False)
    
        return render_template("accounts.html", users=users, page=page, get_page_range=get_page_range, users_per_page=users_per_page, search=search_query, type_filter=type_filter)
    else:
        flash("Cut it with the shenanigans.", "danger")
        return redirect(url_for("menu"))

def get_meal_tag_json(meal_id):
    meal = Meal.query.get(meal_id)
    if not meal:
        return {"error": "Meal not found"}, 404

    tags_data = []
    for tag in meal.tags:
        options_data = []
        for option in tag.options:
            options_data.append({
                "id": option.id,
                "name": option.name,
                "is_default": option.is_default,
                "price": option.price
            })
        tags_data.append({
            "id": tag.id,
            "name": tag.name,
            "type": tag.type,
            "options": options_data
        })
    return tags_data
        
# Route for the main page
@app.route("/customizemeal", methods=["POST", "GET"])
def customizemeal():

    meal_id = int(request.args.get('meal_id'))
    meal = Meal.query.filter_by(id=meal_id).first()
    tags_data = get_meal_tag_json(meal_id)

    if request.method == 'POST':
        return redirect(url_for("menu"))

    mealData = [meal.name, meal.price, get_meal_tag_json(meal_id)]
    image_data_b64 = base64.b64encode(meal.image_data).decode('utf-8')

    return render_template("customizemeal.html", meal=meal, image_data_b64=image_data_b64, tags_data=tags_data, mealData=mealData)

# Route for the main page
@app.route("/vieworders")
def vieworders():
    meals = Meal.query.order_by(asc(Meal.id))
    mealsData = {i.id: [i.name, i.price, get_meal_tag_json(i.id)] for i in meals}
    one_day_ago = datetime.now() - timedelta(days=1)
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    current_orders = Order.query.filter_by(user_id=current_user.id).filter(Order.timestamp >= today_start).all()
    orders = Order.query.filter_by(user_id=current_user.id).all()
    old_orders = Order.query.filter_by(user_id=current_user.id).filter(Order.timestamp < today_start).all()
    orderData = {str(order.id) : order.json for order in orders}
    return render_template("vieworders.html", orders=orders, current_orders=current_orders, old_orders=old_orders, mealsData=mealsData, orderData=orderData)

# Route for the main page
@app.route("/balance", methods=["GET", "POST"])
def balance():
    if request.method == "POST":
        amount = float(request.form.get("amount"))
        action = request.form.get("action")

        if action == "add":
            current_user.balance += amount
            flash("Balance successfully increased.", "success")
        elif action == "subtract":
            if current_user.balance >= amount:
                current_user.balance -= amount
                flash("Balance successfully decreased.", "success")
            else:
                flash("Insufficient balance.", "danger")

        db.session.commit()

    return render_template("balance.html")

@app.route("/stats", methods=["GET"])
@login_required
def stats():
    meals = Meal.query.order_by(asc(Meal.id)).all()
    orders = Order.query.all()

    # Initialize a dictionary to hold the counts of each meal
    meal_counts = {meal.id: 0 for meal in meals}

    # Initialize a dictionary to hold the counts of each meal ordered each day
    orders_over_time = {meal.id: {} for meal in meals}

    # Process each order to count the meals and orders over time
    for order in orders:
        order_items = order.json
        order_date = order.timestamp.date().isoformat()
        for item in order_items:
            meal_id = item[0]
            if meal_id in meal_counts:
                meal_counts[meal_id] += 1
                if order_date not in orders_over_time[meal_id]:
                    orders_over_time[meal_id][order_date] = 0
                orders_over_time[meal_id][order_date] += 1

    # Transform orders_over_time to a format suitable for Chart.js
    dates = sorted({date for meal_dates in orders_over_time.values() for date in meal_dates})
    meal_order_data = {
        meal.id: [orders_over_time[meal.id].get(date, 0) for date in dates]
        for meal in meals
    }

    # Create a dictionary to map meal ids to names
    meal_names = {meal.id: meal.name for meal in meals}

    return render_template("stats.html", meals=meals, meal_counts=meal_counts, dates=dates, meal_order_data=meal_order_data, meal_names=meal_names)

@app.route("/addaccount", methods=["POST", "GET"])
def addaccount():
    if request.method == "POST":
        # Get form data
        first_name = request.form.get("first_name")
        last_name = request.form.get("last_name")
        email = request.form.get("email")
        school_id = request.form.get("school_id")
        confirm_school_id = request.form.get("confirm_school_id")
        lunch_period = int(request.form.get("lunch_period"))
        account_type = request.form.get("type")

        print(account_type)

        if account_type == "on":
            account_type = 2
        else:
            account_type = 0

        # Validate form data (add your own validation logic)
        if not (
            first_name
            and last_name
            and email
            and school_id
            and confirm_school_id
            and lunch_period
            and lunch_period >= 4
            and lunch_period <= 7
            and lunch_period == round(lunch_period)
        ):
        # Handle invalid input
            flash("Please fill in all fields.", "danger")
            return render_template("addaccount.html")
        #handle if existing user
        user = User.query.filter_by(email=email).first()
        if len(school_id) != 6:
            flash("User school ID must be 6 values long", "danger")
            return render_template("addaccount.html")
        if user is not None and email == user.email:
            # Handle school_id mismatch
            flash("User already exist! Try a different email", "danger")
            return render_template("addaccount.html")
        if school_id != confirm_school_id:
            # Handle school_id mismatch
            flash("Passwords do not match.", "danger")
            return render_template("addaccount.html")

        # Get image data
        # image_data = image_file.read()

        # Create a new user instance

        new_user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            school_id=school_id,
            balance=0,
            lunch_period=int(lunch_period),
            type=account_type
        )

        # Save the new user to the database
        db.session.add(new_user)
        db.session.commit()

        flash("Account created successfully!", "success")
        return redirect(url_for('accounts'))
    return render_template("addaccount.html")

@app.route('/editaccount', methods=['GET', 'POST'])
@login_required
def edit_account():
    if not current_user.type == 1:
        flash("Unauthorized access!", "danger")
        return redirect(url_for('menu'))

    user_id = request.args.get('user_id')
    if not user_id:
        flash("No user specified!", "danger")
        return redirect(url_for('accounts'))

    user = User.query.get_or_404(user_id)

    if request.method == 'POST':
        user.first_name = request.form['first_name']
        user.last_name = request.form['last_name']
        user.email = request.form['email']
        user.school_id = request.form['school_id']
        user.balance = float(request.form['balance'])

        try:
            db.session.commit()
            flash('Account updated successfully!', 'success')
            return redirect(url_for('accounts'))
        except IntegrityError:
            db.session.rollback()
            flash('Error updating account. Please ensure the details are correct.', 'danger')

    return render_template('editaccount.html', user=user)

@app.route('/deleteaccount/<int:user_id>', methods=['POST'])
def delete_account(user_id):
    user_to_delete = User.query.get(user_id)
    db.session.delete(user_to_delete)
    db.session.commit()
    flash("Account deleted successfully", "warning")
    return redirect(url_for("accounts"))

@app.route('/deleteallaccounts')
def delete_all_accounts():
    accounts = User.query.filter_by(type=0).all()
    for account in accounts:
        db.session.delete(account)
    db.session.commit()
    flash("All non-admin accounts deleted successfully.", "warning")
    return redirect(url_for("accounts"))

def parse_csv_data(csv_file):
    text_data = csv_file.read().decode("utf-8")
    reader = csv.reader(io.StringIO(text_data))
    data = [row for row in reader]
    return data


# Function to add CSV data to the database
def add_csv_data_to_database(csv_data):
    for row in csv_data:
        try:
            new_user = User(
                first_name=row[0].strip(),
                last_name=row[1].strip(),
                email=row[2].strip(),
                school_id=row[3].strip(),
                balance=0,
                type=row[4],
                lunch_period=row[5]
            )
            db.session.add(new_user)
            db.session.commit()
        except IntegrityError as e:
            db.session.rollback()
            print(f"IntegrityError: {e.orig}")  # Log the specific error message
            flash(f"Error adding user with email {row[2]}. This email might already exist.", "danger")
        except Exception as e:
            db.session.rollback()
            print(f"Exception: {e}")  # Log any other exceptions
            flash(f"An unexpected error occurred while adding user with email {row[2]}.", "danger")

@app.route("/bulk_upload", methods=["GET", "POST"])
@login_required
def bulkupload():
    if current_user.type == 1:
        csv_file = request.files["csv_file"]
        if csv_file:
            csv_data = parse_csv_data(csv_file)
            add_csv_data_to_database(csv_data)
            flash("Accounts successfully added", "success")
        else:
            flash("No file uploaded or invalid file format.", "danger")
    return redirect(url_for('accounts'))

# @app.route("/commit", methods=["POST"])
# @login_required
# def commit():
#     db.session.commit()
#     referer = request.headers.get('Referer')
#     if referer:
#         return redirect(referer)
#     else:
#         # If no Referer header, redirect to home page or a default page
#         return redirect(url_for('menu'))

app.secret_key = 'super secret key'

if __name__ == "__main__":
    # Quick test configuration. Please use proper Flask configuration options
    # in production settings, and use a separate file or environment variables
    # to manage the secret key!
    
    app.config['SESSION_TYPE'] = 'filesystem'

    app.debug = True
    app.run()