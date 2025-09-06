const { db } = require('./db-setup');

const BlogPost = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM blog_posts ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM blog_posts WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  create: (post) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO blog_posts (title, body) VALUES (?, ?)',
        [post.title, post.body],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...post });
          }
        }
      );
    });
  },

  update: (id, post) => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE blog_posts SET title = ?, body = ? WHERE id = ?',
        [post.title, post.body, id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, ...post });
          }
        }
      );
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM blog_posts WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ deleted: this.changes > 0 });
        }
      });
    });
  }
};

module.exports = BlogPost;
