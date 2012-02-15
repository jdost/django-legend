# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding model 'Album'
        db.create_table('gallery_album', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('description', self.gf('django.db.models.fields.CharField')(max_length=250)),
            ('url', self.gf('django.db.models.fields.SlugField')(max_length=50, db_index=True)),
        ))
        db.send_create_signal('gallery', ['Album'])

        # Adding model 'Image'
        db.create_table('gallery_image', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('url', self.gf('django.db.models.fields.SlugField')(max_length=5, db_index=True)),
            ('file', self.gf('django.db.models.fields.CharField')(max_length=15)),
            ('views', self.gf('django.db.models.fields.IntegerField')(default=0)),
            ('caption', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('album', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['gallery.Album'])),
        ))
        db.send_create_signal('gallery', ['Image'])

        # Adding model 'Header'
        db.create_table('gallery_header', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('file', self.gf('django.db.models.fields.CharField')(max_length=25)),
            ('caption', self.gf('django.db.models.fields.CharField')(max_length=200)),
        ))
        db.send_create_signal('gallery', ['Header'])


    def backwards(self, orm):
        
        # Deleting model 'Album'
        db.delete_table('gallery_album')

        # Deleting model 'Image'
        db.delete_table('gallery_image')

        # Deleting model 'Header'
        db.delete_table('gallery_header')


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
            'caption': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'file': ('django.db.models.fields.CharField', [], {'max_length': '15'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'url': ('django.db.models.fields.SlugField', [], {'max_length': '5', 'db_index': 'True'}),
            'views': ('django.db.models.fields.IntegerField', [], {'default': '0'})
        }
    }

    complete_apps = ['gallery']
