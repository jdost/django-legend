# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Deleting model 'Header'
        db.delete_table('gallery_header')

        # Adding field 'Image.date'
        db.add_column('gallery_image', 'date', self.gf('django.db.models.fields.DateTimeField')(default=datetime.date(1, 1, 1)), keep_default=False)


    def backwards(self, orm):
        
        # Adding model 'Header'
        db.create_table('gallery_header', (
            ('caption', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('file', self.gf('django.db.models.fields.CharField')(max_length=25)),
        ))
        db.send_create_signal('gallery', ['Header'])

        # Deleting field 'Image.date'
        db.delete_column('gallery_image', 'date')


    models = {
        'gallery.album': {
            'Meta': {'object_name': 'Album'},
            'cover': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '15'}),
            'description': ('django.db.models.fields.CharField', [], {'max_length': '250'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'url': ('django.db.models.fields.SlugField', [], {'max_length': '50', 'db_index': 'True'})
        },
        'gallery.image': {
            'Meta': {'object_name': 'Image'},
            'album': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['gallery.Album']"}),
            'caption': ('django.db.models.fields.CharField', [], {'max_length': '500'}),
            'date': ('django.db.models.fields.DateTimeField', [], {}),
            'file': ('django.db.models.fields.CharField', [], {'max_length': '15'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'url': ('django.db.models.fields.SlugField', [], {'max_length': '15', 'db_index': 'True'}),
            'views': ('django.db.models.fields.IntegerField', [], {'default': '0'})
        }
    }

    complete_apps = ['gallery']
