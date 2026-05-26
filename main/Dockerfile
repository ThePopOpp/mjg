FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY about-us.html /usr/share/nginx/html/about-us.html
COPY our-mission /usr/share/nginx/html/our-mission
COPY contact.html /usr/share/nginx/html/contact.html
COPY resources.html /usr/share/nginx/html/resources.html
COPY post.html /usr/share/nginx/html/post.html
RUN chmod 644 /usr/share/nginx/html/index.html \
              /usr/share/nginx/html/about-us.html \
              /usr/share/nginx/html/our-mission \
              /usr/share/nginx/html/contact.html \
              /usr/share/nginx/html/resources.html \
              /usr/share/nginx/html/post.html
