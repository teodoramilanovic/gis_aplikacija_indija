<?php

$con = pg_connect("host=localhost port=5432 dbname=gis_app user=postgres password=password");

$naziv = $_POST['naziv'];
$povrsina = $_POST['povrsina'];

       $Query = "DROP TABLE IF EXISTS public.analize;
                   CREATE TABLE public.analize AS (SELECT * FROM public.ind_water_areas_dcw WHERE ST_Intersects(geom, (SELECT 
                   d.geom FROM public.ind_adm1 d WHERE d.name_1='$naziv')) AND
                   (ST_Area(geom,false)/10.764)>$povrsina);
       ALTER TABLE public.analize ADD COLUMN id serial primary key;
       CREATE INDEX idx_analize ON public.analize USING gist (geom);
                 ";
       $ExecQuery = pg_query($con, $Query);
       

        shell_exec('curl -u admin:geoserver -v -XPOST http://localhost:8080/geoserver/rest/reload');

?>
