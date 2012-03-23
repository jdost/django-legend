# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Changing field 'Image.url'
        db.alter_column('gallery_image', 'url', self.gf('django.db.models.fields.SlugField')(max_length=10))

        # Changing field 'Image.caption'
        db.alter_column('gallery_image', 'caption', self.gf('django.db.models.fields.CharField')(max_length=500))


    def backwards(self, orm):
        
        # Changing field 'Image.url'
        db.alter_column('gallery_image', 'url', self.gf('django.db.models.fields.SlugField')(max_length=5))

        # Changing field 'Image.caption'
        db.alter_column('gallery_image', 'caption', self.gf('django.db.models.fields.CharField')(max_length=200))


    models = {
        'gallery.album': {
            'Meta': {'object_name': 'Album'},
            'description': ('django.db.models.fields.CharField', [], {'max_length': '250'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'url': ('django.db.models.fields.SlugField', [], {'max_length': '50', 'db_index': 'True'})
        },
        'gallery.header': {
            'Meta': {'object_name': 'Header'},
            'caption': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'file': ('django.db.models.fields.CharField', [], {'max_length': '25'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        'gallery.image': {
            'Meta': {'object_name': 'Image'},
            'album': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['gallery.Album']"}),
            'caption': ('django.db.models.fields.CharField', [], {'max_length': '500'}),
            'file': ('django.db.models.fields.CharField', [], {'max_length': '15'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'url': ('django.db.models.fields.SlugField', [], {'max_length': '10', 'db_index': 'True'}),
            'views': ('django.db.models.fields.IntegerField', [], {'default': '0'})
        }
    }

    complete_apps = ['gallery']
